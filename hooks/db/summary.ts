import { useEffect, useState, useCallback } from "react";
import { alias } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

import { useDB } from ".";
import { expenses, accounts, currencies, expenseCategories } from "@/db/schema";

type SummaryByCategory = {
  categoryName: string;
  total: number;
};

type SummaryByCurrency = {
  currencyCode: string;
  currencySymbol: string;
  totalExpense: number;
  categories: SummaryByCategory[];
};

export const useExpenseSummary = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const db = useDB();
  const [data, setData] = useState<SummaryByCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!startDate || !endDate) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const e = alias(expenses, "e");
      const c = alias(expenseCategories, "c");
      const p = alias(expenseCategories, "p");

      const result = await db
        .select({
          currencyCode: currencies.code,
          currencySymbol: currencies.symbol,
          categoryName: sql<string>`COALESCE(${p.name}, ${c.name})`,
          total: sql<number>`SUM(${e.amount})`,
        })
        .from(e)
        .innerJoin(accounts, eq(e.accountId, accounts.id))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .innerJoin(c, eq(e.categoryId, c.id))
        .leftJoin(p, eq(c.parentId, p.id))
        .where(sql`${e.date} >= ${startDate} AND ${e.date} <= ${endDate}`)
        .groupBy(() => [
          currencies.code,
          currencies.symbol,
          sql`COALESCE(${p.name}, ${c.name})`,
        ]);

      // Group by currency
      const grouped: Record<string, SummaryByCurrency> = {};

      for (const row of result) {
        const key = row.currencyCode;
        if (!grouped[key]) {
          grouped[key] = {
            currencyCode: row.currencyCode,
            currencySymbol: row.currencySymbol,
            totalExpense: 0,
            categories: [],
          };
        }

        grouped[key].totalExpense += row.total;
        grouped[key].categories.push({
          categoryName: row.categoryName,
          total: row.total,
        });
      }

      setData(Object.values(grouped));
    } catch (err) {
      console.error("useExpenseSummary error:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
};
