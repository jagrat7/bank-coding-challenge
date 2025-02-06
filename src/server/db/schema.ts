import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `bank-coding-challange_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdById: text("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export type ProcessStage = 'uploaded' | 'processing' | 'completed' | 'failed'

export const statement = createTable(
  "statement",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }).notNull(),
    userId: text("user_id", { length: 255 }).notNull(),
    name: text("name", { length: 255 }),
    content: text("content").notNull(),
    processStage: text("process_stage", { enum: ['uploaded', 'processing', 'completed', 'failed'] }).default('uploaded').notNull(),
    processedAt: int("processed_at", { mode: "timestamp" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
);

export const transaction = createTable(
  "transaction",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    statementId: int("statement_id", { mode: "number" })
      .notNull()
      .references(() => statement.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    description: text("description").notNull(),
    amount: int("amount", { mode: "number" }).notNull(), // Store in cents/smallest currency unit
    type: text("type", { enum: ['deposit', 'withdrawal'] }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    statementIdIdx: index("statement_id_idx").on(table.statementId),
    dateIdx: index("date_idx").on(table.date),
    typeIdx: index("type_idx").on(table.type),
  }),
);

export const statementMetrics = createTable(
  "statement_metrics",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    statementId: int("statement_id", { mode: "number" })
      .notNull()
      .references(() => statement.id, { onDelete: "cascade" }),
    totalDeposits: int("total_deposits", { mode: "number" }).notNull(), // Store in cents
    totalWithdrawals: int("total_withdrawals", { mode: "number" }).notNull(), // Store in cents
    balance: int("balance", { mode: "number" }).notNull(), // Store in cents
    outstandingLoans: int("outstanding_loans", { mode: "number" }).notNull(),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    statementIdIdx: index("metrics_statement_id_idx").on(table.statementId),
    periodIdx: index("period_idx").on(table.periodStart, table.periodEnd),
  }),
);

export const statementInsight = createTable(
  "statement_insight",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    statementId: int("statement_id", { mode: "number" })
      .notNull()
      .references(() => statement.id, { onDelete: "cascade" }),
    insight: text("insight").notNull(),
    category: text("category", { 
      enum: ['stability', 'expense', 'debt', 'ratio', 'recommendation'] 
    }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    statementIdIdx: index("insight_statement_id_idx").on(table.statementId),
    categoryIdx: index("category_idx").on(table.category),
  }),
);

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
