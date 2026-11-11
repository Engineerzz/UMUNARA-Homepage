import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const reportCategoryEnum = pgEnum("report_category", [
  "momo_scam",
  "airtel_money_scam",
  "bank_scam",
  "fake_job",
  "fake_lottery",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "approved",
  "rejected",
  "stopped",
  "cleaned",
  "deleted",
]);

export const safetyReportsTable = pgTable(
  "safety_reports",
  {
    id: serial("id").primaryKey(),
    phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
    category: reportCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    evidenceObjectPath: text("evidence_object_path"),
    reporterPhone: varchar("reporter_phone", { length: 32 }),
    reporterId: varchar("reporter_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    status: reportStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("safety_reports_phone_status_idx").on(table.phoneNumber, table.status),
    index("safety_reports_created_at_idx").on(table.createdAt),
  ],
);

export const reportModerationEventsTable = pgTable(
  "report_moderation_events",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .notNull()
      .references(() => safetyReportsTable.id, { onDelete: "cascade" }),
    actorEmail: varchar("actor_email", { length: 320 }).notNull(),
    status: reportStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("report_moderation_events_report_idx").on(table.reportId)],
);

export const numberChecksTable = pgTable(
  "number_checks",
  {
    id: serial("id").primaryKey(),
    classification: varchar("classification", { length: 32 }).notNull(),
    checkedAt: timestamp("checked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("number_checks_checked_at_idx").on(table.checkedAt)],
);

export const transferProvidersTable = pgTable("transfer_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  logoText: varchar("logo_text", { length: 30 }).notNull(),
  worksWithMomo: boolean("works_with_momo").notNull().default(false),
  worksWithAirtel: boolean("works_with_airtel").notNull().default(false),
  worksWithBanks: boolean("works_with_banks").notNull().default(false),
  feeInformation: text("fee_information"),
  speedInformation: varchar("speed_information", { length: 300 }),
  sourceUrl: text("source_url"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
