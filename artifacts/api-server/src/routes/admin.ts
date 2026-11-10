import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import {
  CreateTransferProviderBody,
  ListAdminReportsQueryParams,
  UpdateReportStatusBody,
  UpdateReportStatusParams,
  UpdateTransferProviderBody,
  UpdateTransferProviderParams,
} from "@workspace/api-zod";
import {
  db,
  numberChecksTable,
  reportModerationEventsTable,
  safetyReportsTable,
  transferProvidersTable,
  usersTable,
} from "@workspace/db";
import { Router, type IRouter, type Request, type Response } from "express";
import { requireAdmin } from "../middlewares/admin";

const router: IRouter = Router();
router.use(requireAdmin);

router.get(
  "/admin/summary",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [allReports, pending, approved, numbers, checks, users] =
        await Promise.all([
          db.select({ value: count() }).from(safetyReportsTable),
          db
            .select({ value: count() })
            .from(safetyReportsTable)
            .where(eq(safetyReportsTable.status, "pending")),
          db
            .select({ value: count() })
            .from(safetyReportsTable)
            .where(eq(safetyReportsTable.status, "approved")),
          db
            .select({
              value: sql<number>`count(distinct ${safetyReportsTable.phoneNumber})::int`,
            })
            .from(safetyReportsTable)
            .where(eq(safetyReportsTable.status, "approved")),
          db.select({ value: count() }).from(numberChecksTable),
          db.select({ value: count() }).from(usersTable),
        ]);

      res.json({
        totalReports: Number(allReports[0]?.value ?? 0),
        pendingReports: Number(pending[0]?.value ?? 0),
        approvedReports: Number(approved[0]?.value ?? 0),
        reportedNumbers: Number(numbers[0]?.value ?? 0),
        numberChecks: Number(checks[0]?.value ?? 0),
        registeredUsers: Number(users[0]?.value ?? 0),
      });
    } catch (error) {
      req.log.error({ err: error }, "Could not load admin summary");
      res.status(500).json({ error: "Dashboard summary is unavailable." });
    }
  },
);

router.get(
  "/admin/reports",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = ListAdminReportsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid report filters." });
      return;
    }

    const filters = [];
    if (parsed.data.status) {
      filters.push(eq(safetyReportsTable.status, parsed.data.status));
    }
    if (parsed.data.search?.trim()) {
      const term = `%${parsed.data.search.trim()}%`;
      filters.push(
        or(
          ilike(safetyReportsTable.phoneNumber, term),
          ilike(safetyReportsTable.description, term),
          ilike(usersTable.email, term),
        ),
      );
    }

    try {
      const reports = await db
        .select({
          id: safetyReportsTable.id,
          phoneNumber: safetyReportsTable.phoneNumber,
          category: safetyReportsTable.category,
          description: safetyReportsTable.description,
          evidenceObjectPath: safetyReportsTable.evidenceObjectPath,
          reporterPhone: safetyReportsTable.reporterPhone,
          reporterEmail: usersTable.email,
          status: safetyReportsTable.status,
          createdAt: safetyReportsTable.createdAt,
        })
        .from(safetyReportsTable)
        .leftJoin(usersTable, eq(safetyReportsTable.reporterId, usersTable.id))
        .where(and(...filters))
        .orderBy(desc(safetyReportsTable.createdAt))
        .limit(500);
      res.json(
        reports.map((report) => ({
          ...report,
          createdAt: report.createdAt.toISOString(),
        })),
      );
    } catch (error) {
      req.log.error({ err: error }, "Could not load admin reports");
      res.status(500).json({ error: "Reports are unavailable." });
    }
  },
);

router.patch(
  "/admin/reports/:reportId",
  async (req: Request, res: Response): Promise<void> => {
    const idParsed = UpdateReportStatusParams.safeParse(req.params);
    const bodyParsed = UpdateReportStatusBody.safeParse(req.body);
    if (!idParsed.success || !bodyParsed.success) {
      res.status(400).json({ error: "Invalid report update." });
      return;
    }
    const id = Number(idParsed.data.reportId);
    const actorEmail = req.user?.email?.trim().toLowerCase();
    if (!actorEmail) {
      res.status(403).json({ error: "Administrator email is unavailable." });
      return;
    }

    try {
      const updated = await db.transaction(async (tx) => {
        const [report] = await tx
          .update(safetyReportsTable)
          .set({ status: bodyParsed.data.status })
          .where(eq(safetyReportsTable.id, id))
          .returning();
        if (!report) return null;
        await tx.insert(reportModerationEventsTable).values({
          reportId: report.id,
          actorEmail,
          status: report.status,
        });
        const [user] = report.reporterId
          ? await tx
              .select({ email: usersTable.email })
              .from(usersTable)
              .where(eq(usersTable.id, report.reporterId))
              .limit(1)
          : [];
        return { report, reporterEmail: user?.email ?? null };
      });

      if (!updated) {
        res.status(404).json({ error: "Report not found." });
        return;
      }
      res.json({
        id: updated.report.id,
        phoneNumber: updated.report.phoneNumber,
        category: updated.report.category,
        description: updated.report.description,
        evidenceObjectPath: updated.report.evidenceObjectPath,
        reporterPhone: updated.report.reporterPhone,
        reporterEmail: updated.reporterEmail,
        status: updated.report.status,
        createdAt: updated.report.createdAt.toISOString(),
      });
    } catch (error) {
      req.log.error({ err: error }, "Could not update report");
      res.status(500).json({ error: "The report could not be updated." });
    }
  },
);

router.get(
  "/admin/users",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt))
        .limit(500);
      res.json(
        users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
      );
    } catch (error) {
      req.log.error({ err: error }, "Could not load registered users");
      res.status(500).json({ error: "Registered users are unavailable." });
    }
  },
);

router.get(
  "/admin/providers",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = await db
        .select()
        .from(transferProvidersTable)
        .orderBy(transferProvidersTable.name);
      res.json(providers);
    } catch (error) {
      req.log.error({ err: error }, "Could not load provider records");
      res.status(500).json({ error: "Provider records are unavailable." });
    }
  },
);

router.post(
  "/admin/providers",
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreateTransferProviderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Check the provider details and try again." });
      return;
    }
    const provider = parsed.data;
    if (provider.published && (!provider.sourceUrl || !provider.verifiedAt)) {
      res.status(400).json({
        error: "Add an official source and verification date before publishing.",
      });
      return;
    }

    try {
      const [created] = await db
        .insert(transferProvidersTable)
        .values({
          ...provider,
          verifiedAt: provider.verifiedAt ? new Date(provider.verifiedAt) : null,
        })
        .returning();
      res.status(201).json(created);
    } catch (error) {
      req.log.error({ err: error }, "Could not create provider record");
      res.status(500).json({ error: "The provider could not be saved." });
    }
  },
);

router.patch(
  "/admin/providers/:providerId",
  async (req: Request, res: Response): Promise<void> => {
    const idParsed = UpdateTransferProviderParams.safeParse(req.params);
    const bodyParsed = UpdateTransferProviderBody.safeParse(req.body);
    if (!idParsed.success || !bodyParsed.success) {
      res.status(400).json({ error: "Invalid provider update." });
      return;
    }
    const update = bodyParsed.data;
    const providerId = Number(idParsed.data.providerId);

    try {
      const [existing] = await db
        .select()
        .from(transferProvidersTable)
        .where(eq(transferProvidersTable.id, providerId))
        .limit(1);
      if (!existing) {
        res.status(404).json({ error: "Provider not found." });
        return;
      }
      const sourceUrl =
        update.sourceUrl === undefined ? existing.sourceUrl : update.sourceUrl;
      const verifiedAt =
        update.verifiedAt === undefined
          ? existing.verifiedAt
          : update.verifiedAt
            ? new Date(update.verifiedAt)
            : null;
      if (update.published && (!sourceUrl || !verifiedAt)) {
        res.status(400).json({
          error: "Add an official source and verification date before publishing.",
        });
        return;
      }

      const [saved] = await db
        .update(transferProvidersTable)
        .set({
          ...update,
          verifiedAt:
            update.verifiedAt === undefined
              ? undefined
              : update.verifiedAt
                ? new Date(update.verifiedAt)
                : null,
          updatedAt: new Date(),
        })
        .where(eq(transferProvidersTable.id, providerId))
        .returning();
      res.json(saved);
    } catch (error) {
      req.log.error({ err: error }, "Could not update provider record");
      res.status(500).json({ error: "The provider could not be updated." });
    }
  },
);

export default router;
