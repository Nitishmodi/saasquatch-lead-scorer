import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { CompanyProfile } from "@/lib/types";

export const companies = sqliteTable("companies", {
  domain: text("domain").primaryKey(),
  profile: text("profile", { mode: "json" }).$type<CompanyProfile>().notNull(),
  fetchedAt: integer("fetched_at", { mode: "timestamp" }).notNull(),
});
