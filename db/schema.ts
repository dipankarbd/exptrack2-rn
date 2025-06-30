import { sql } from "drizzle-orm";
import {
  foreignKey,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const accountTypes = ["Bank", "Cash", "CreditCard"] as const;
export const accountStates = ["Active", "Inactive", "Closed"] as const;
export const incomeSources = ["Salary", "Interest", "Profit", "Other"] as const;

export const currencies = sqliteTable("currencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  description: text("description").notNull(),
  symbol: text("symbol").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", {
    enum: accountTypes,
  }).notNull(),
  state: text("state", {
    enum: accountStates,
  })
    .default("Active")
    .notNull(),
  currencyId: integer("currency_id")
    .notNull()
    .references(() => currencies.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const balances = sqliteTable("balances", {
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  amount: real("amount").notNull().default(0),
});

export const transfers = sqliteTable("transfers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromAccountId: integer("from_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  toAccountId: integer("to_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  amount: real("amount").notNull(),
  conversionRate: real("conversion_rate").notNull().default(1.0),
  date: text("date")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const incomes = sqliteTable("incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  source: text("source", {
    enum: incomeSources,
  }).notNull(),
  amount: real("amount").notNull(),
  date: text("date")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const expenseCategories = sqliteTable(
  "expense_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    parentId: integer("parent_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "expense_categories_parent_id_fkey",
    }),
  ]
);

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .references(() => expenseCategories.id, { onDelete: "restrict" })
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id, { onDelete: "restrict" })
    .notNull(),
  amount: real("amount").notNull(),
  date: text("date")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type AccountType = (typeof accountTypes)[number];
export type AccountState = (typeof accountStates)[number];
export type IncomeSource = (typeof incomeSources)[number];

export type Currency = typeof currencies.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Balance = typeof balances.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type Income = typeof incomes.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
