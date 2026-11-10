import {
  and,
  count,
  desc,
  eq,
  inArray,
  sql,
} from "drizzle-orm";
import {
  BulkCheckPhoneNumbersBody,
  CheckPhoneNumberBody,
  ListRecentReportsQueryParams,
  SubmitSafetyReportBody,
} from "@workspace/api-zod";
import {
  db,
  numberChecksTable,
  safetyReportsTable,
  transferProvidersTable,
} from "@workspace/db";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function canonicalPhoneNumber(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value.trim(), "RW");
  return parsed?.isValid() ? parsed.number : null;
}

async function classifyNumbers(phoneNumbers: string[]) {
  const uniqueNumbers = [...new Set(phoneNumbers)];
  const reports =
    uniqueNumbers.length > 0
      ? await db
          .select({
            phoneNumber: safetyReportsTable.phoneNumber,
            category: safetyReportsTable.category,
          })
          .from(safetyReportsTable)
          .where(
            and(
              inArray(safetyReportsTable.phoneNumber, uniqueNumbers),
              eq(safetyReportsTable.status, "approved"),
            ),
          )
      : [];

  const byNumber = new Map<
    string,
    { count: number; categories: Set<string> }
  >();
  for (const report of reports) {
    const current = byNumber.get(report.phoneNumber) ?? {
      count: 0,
      categories: new Set<string>(),
    };
    current.count += 1;
    current.categories.add(report.category);
    byNumber.set(report.phoneNumber, current);
  }

  const results = phoneNumbers.map((phoneNumber) => {
    const entry = byNumber.get(phoneNumber);
    const reportCount = entry?.count ?? 0;
    return {
      phoneNumber,
      classification: reportCount > 0 ? "reported_scam" : "no_reports",
      reportCount,
      categories: entry ? [...entry.categories] : [],
      explanation:
        reportCount > 0
          ? `${reportCount} approved community report${reportCount === 1 ? "" : "s"} found. Verify independently before taking action.`
          : "No approved community reports are on record. This does not confirm the number is safe.",
    };
  });

  if (results.length > 0) {
    await db.insert(numberChecksTable).values(
      results.map((result) => ({ classification: result.classification })),
    );
  }
  return results;
}

router.post(
  "/safety/check",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CheckPhoneNumberBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Enter a phone number to check." });
      return;
    }
    const normalized = canonicalPhoneNumber(parsed.data.phoneNumber);
    if (!normalized) {
      res.status(400).json({ error: "Enter a valid international phone number." });
      return;
    }

    try {
      const [result] = await classifyNumbers([normalized]);
      res.json(result);
    } catch (error) {
      req.log.error({ err: error }, "Could not check phone number");
      res.status(500).json({ error: "The number could not be checked right now." });
    }
  },
);

router.post(
  "/safety/bulk-check",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = BulkCheckPhoneNumbersBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Upload or enter up to 200 valid numbers." });
      return;
    }
    const normalized = parsed.data.phoneNumbers.map(canonicalPhoneNumber);
    if (normalized.some((number) => !number)) {
      res.status(400).json({
        error: "One or more phone numbers are invalid. Use international format or a Rwanda number.",
      });
      return;
    }

    try {
      const results = await classifyNumbers(normalized as string[]);
      res.json({ results });
    } catch (error) {
      req.log.error({ err: error }, "Could not bulk check phone numbers");
      res.status(500).json({ error: "The numbers could not be checked right now." });
    }
  },
);

router.get(
  "/safety/reports",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = ListRecentReportsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid report list request." });
      return;
    }
    const limit = parsed.data.limit ?? 30;

    try {
      const rows = await db
        .select({
          phoneNumber: safetyReportsTable.phoneNumber,
          category: sql<string>`(array_agg(${safetyReportsTable.category}))[1]`,
          reportCount: sql<number>`count(*)::int`,
          latestReportedAt: sql<Date>`max(${safetyReportsTable.createdAt})`,
        })
        .from(safetyReportsTable)
        .where(eq(safetyReportsTable.status, "approved"))
        .groupBy(safetyReportsTable.phoneNumber)
        .orderBy(desc(sql`max(${safetyReportsTable.createdAt})`))
        .limit(limit);

      res.json(
        rows.map((row) => ({
          ...row,
          latestReportedAt: row.latestReportedAt.toISOString(),
          status: "reported_scam" as const,
        })),
      );
    } catch (error) {
      req.log.error({ err: error }, "Could not list recent reports");
      res.status(500).json({ error: "Recent reports are unavailable." });
    }
  },
);

router.post(
  "/safety/reports",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = SubmitSafetyReportBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Check the report details and try again." });
      return;
    }

    const phoneNumber = canonicalPhoneNumber(parsed.data.phoneNumber);
    if (!phoneNumber) {
      res.status(400).json({ error: "Enter a valid phone number." });
      return;
    }
    const evidenceObjectPath = parsed.data.evidenceObjectPath ?? null;
    if (evidenceObjectPath && !req.isAuthenticated()) {
      res.status(401).json({ error: "Sign in before uploading private proof." });
      return;
    }
    if (
      evidenceObjectPath &&
      !/^\/objects\/uploads\/[A-Za-z0-9._/-]+$/.test(evidenceObjectPath)
    ) {
      res.status(400).json({ error: "The proof upload path is invalid." });
      return;
    }

    try {
      if (evidenceObjectPath) {
        const adminEmail = process.env.UMUNARA_ADMIN_EMAIL?.trim().toLowerCase();
        if (!adminEmail) {
          res.status(503).json({ error: "Private evidence uploads are not configured." });
          return;
        }
        await objectStorageService.trySetObjectEntityAclPolicy(
          evidenceObjectPath,
          { owner: adminEmail, visibility: "private" },
        );
      }

      const [report] = await db
        .insert(safetyReportsTable)
        .values({
          phoneNumber,
          category: parsed.data.category,
          description: parsed.data.description.trim(),
          evidenceObjectPath,
          reporterPhone: parsed.data.reporterPhone?.trim() || null,
          reporterId: req.user?.id ?? null,
          status: "pending",
        })
        .returning({ id: safetyReportsTable.id, status: safetyReportsTable.status });

      res.status(201).json({
        ...report,
        message: "Your report is saved for review. It will not appear publicly until approved.",
      });
    } catch (error) {
      req.log.error({ err: error }, "Could not submit safety report");
      res.status(500).json({ error: "The report could not be submitted right now." });
    }
  },
);

router.get(
  "/safety/providers",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = await db
        .select()
        .from(transferProvidersTable)
        .where(
          and(
            eq(transferProvidersTable.published, true),
            sql`${transferProvidersTable.sourceUrl} IS NOT NULL`,
            sql`${transferProvidersTable.verifiedAt} IS NOT NULL`,
          ),
        )
        .orderBy(transferProvidersTable.name);
      res.json(providers);
    } catch (error) {
      req.log.error({ err: error }, "Could not list transfer providers");
      res.status(500).json({ error: "Transfer provider information is unavailable." });
    }
  },
);

export default router;
