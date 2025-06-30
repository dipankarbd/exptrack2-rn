import { useCallback, useEffect, useState } from "react";
import { useDB } from ".";
import {
  incomes,
  expenses,
  transfers,
  expenseCategories,
  accounts,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

type TransactionItem = {
  id: string;
  type: "Income" | "Expense" | "Transfer In" | "Transfer Out";
  amount: number;
  date: string;
  balance: number;
  description: string;
};

export const useTransactions = ({
  startDate,
  endDate,
  accountId,
}: {
  startDate?: string;
  endDate?: string;
  accountId?: number;
}) => {
  const db = useDB();

  const [data, setData] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (
      startDate === undefined ||
      endDate === undefined ||
      accountId === undefined
    ) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      // 1. Opening balance before startDate
      const beforeCond = sql`date < ${startDate}`;

      let openingBalance = 0;

      const [pastIncomes, pastExpenses, pastTransfers] = await Promise.all([
        db
          .select({ amount: incomes.amount })
          .from(incomes)
          .where(sql`${eq(incomes.accountId, accountId)} AND ${beforeCond}`),

        db
          .select({ amount: expenses.amount })
          .from(expenses)
          .where(sql`${eq(expenses.accountId, accountId)} AND ${beforeCond}`),

        db
          .select({
            from: transfers.fromAccountId,
            to: transfers.toAccountId,
            amount: transfers.amount,
            rate: transfers.conversionRate,
          })
          .from(transfers)
          .where(
            sql`(${eq(transfers.fromAccountId, accountId)} OR ${eq(
              transfers.toAccountId,
              accountId
            )}) AND ${beforeCond}`
          ),
      ]);

      for (const row of pastIncomes) {
        openingBalance += row.amount;
      }

      for (const row of pastExpenses) {
        openingBalance -= row.amount;
      }

      for (const row of pastTransfers) {
        if (row.from === accountId) {
          openingBalance -= row.amount;
        } else {
          openingBalance += row.amount * (row.rate ?? 1);
        }
      }

      // 2. Transactions between startDate and endDate
      const dateCond = sql`date >= ${startDate} AND date <= ${endDate}`;

      const aFrom = alias(accounts, "aFrom");
      const aTo = alias(accounts, "aTo");

      const [curIncomes, curExpenses, curTransfers] = await Promise.all([
        db
          .select({
            id: incomes.id,
            amount: incomes.amount,
            date: incomes.date,
            source: incomes.source,
          })
          .from(incomes)
          .where(sql`${eq(incomes.accountId, accountId)} AND ${dateCond}`),

        db
          .select({
            id: expenses.id,
            amount: expenses.amount,
            date: expenses.date,
            categoryName: expenseCategories.name,
          })
          .from(expenses)
          .innerJoin(
            expenseCategories,
            eq(expenses.categoryId, expenseCategories.id)
          )
          .where(sql`${eq(expenses.accountId, accountId)} AND ${dateCond}`),

        await db
          .select({
            id: transfers.id,
            from: transfers.fromAccountId,
            to: transfers.toAccountId,
            amount: transfers.amount,
            rate: transfers.conversionRate,
            date: transfers.date,
            fromName: aFrom.name,
            toName: aTo.name,
          })
          .from(transfers)
          .leftJoin(aFrom, eq(transfers.fromAccountId, aFrom.id))
          .leftJoin(aTo, eq(transfers.toAccountId, aTo.id))
          .where(
            sql`(${eq(transfers.fromAccountId, accountId)} OR ${eq(
              transfers.toAccountId,
              accountId
            )}) AND ${dateCond}`
          ),
      ]);

      const transactions: Omit<TransactionItem, "balance">[] = [];

      for (const row of curIncomes) {
        transactions.push({
          id: `income-${row.id}`,
          type: "Income",
          amount: row.amount,
          date: row.date,
          description: row.source ?? "Income",
        });
      }

      for (const row of curExpenses) {
        transactions.push({
          id: `expense-${row.id}`,
          type: "Expense",
          amount: -row.amount,
          date: row.date,
          description: row.categoryName ?? "Expense",
        });
      }

      for (const row of curTransfers) {
        if (row.from === accountId) {
          transactions.push({
            id: `transfer-${row.id}-out`,
            type: "Transfer Out",
            amount: -row.amount,
            date: row.date,
            description: `To ${row.toName ?? `Account ${row.to}`}`,
          });
        } else {
          transactions.push({
            id: `transfer-${row.id}-in`,
            type: "Transfer In",
            amount: row.amount * (row.rate ?? 1),
            date: row.date,
            description: `From ${row.fromName ?? `Account ${row.from}`}`,
          });
        }
      }

      // 3. Sort + calculate balance
      transactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let running = openingBalance;
      const result: TransactionItem[] = transactions
        .map((t) => {
          running += t.amount;
          return { ...t, balance: running };
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, startDate, endDate, accountId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransactions,
  };
};
