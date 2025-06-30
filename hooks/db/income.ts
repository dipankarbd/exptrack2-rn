import {
  accounts,
  balances,
  currencies,
  Income,
  incomes,
  IncomeSource,
} from "@/db/schema";
import { desc, eq, SQL, sql } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";

import { useDB } from ".";

type AddIncomeDto = {
  accountId: number;
  source: IncomeSource;
  amount: number;
  date: string;
};

type UpdateIncomeDto = AddIncomeDto & {
  id: number;
};

type IncomeItem = Income & {
  currency: {
    code: string;
    symbol: string;
    description: string;
  };
  account: {
    id: number;
    name: string;
    type: string;
  };
};

export const useIncomes = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const db = useDB();

  const [data, setData] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let condition: SQL = sql`1 = 1`;

      if (startDate && endDate) {
        condition = sql`${incomes.date} >= ${startDate} AND ${incomes.date} <= ${endDate}`;
      } else if (startDate) {
        condition = sql`${incomes.date} >= ${startDate}`;
      } else if (endDate) {
        condition = sql`${incomes.date} <= ${endDate}`;
      } else {
        setData([]);
        return;
      }

      const result = await db
        .select({
          id: incomes.id,
          accountId: incomes.accountId,
          source: incomes.source,
          amount: incomes.amount,
          date: incomes.date,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
          account: {
            id: accounts.id,
            name: accounts.name,
            type: accounts.type,
          },
        })
        .from(incomes)
        .innerJoin(accounts, eq(incomes.accountId, accounts.id))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(condition)
        .orderBy(desc(incomes.date));

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, startDate, endDate]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    data,
    loading,
    error,
    refetch: fetchIncomes,
  };
};

export const useIncomeById = (id: number) => {
  const db = useDB();
  const [income, setIncome] = useState<IncomeItem | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await db
        .select({
          id: incomes.id,
          accountId: incomes.accountId,
          source: incomes.source,
          amount: incomes.amount,
          date: incomes.date,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
          account: {
            id: accounts.id,
            name: accounts.name,
            type: accounts.type,
          },
        })
        .from(incomes)
        .innerJoin(accounts, eq(incomes.accountId, accounts.id))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(eq(incomes.id, id))
        .limit(1)
        .all();

      setIncome(result[0] || null);
    };

    fetch();
  }, [id]);

  return income;
};

export const useAddIncome = () => {
  const db = useDB();

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addIncome = useCallback(
    async (income: AddIncomeDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          await tx.insert(incomes).values(income).run();

          const balanceRow = await tx
            .select({ amount: balances.amount })
            .from(balances)
            .where(eq(balances.accountId, income.accountId))
            .limit(1)
            .get();

          const currentBalance = balanceRow?.amount ?? 0;
          const newBalance = currentBalance + income.amount;

          await tx
            .update(balances)
            .set({ amount: newBalance })
            .where(eq(balances.accountId, income.accountId))
            .run();

          const account = await tx
            .select({ name: accounts.name })
            .from(accounts)
            .where(eq(accounts.id, income.accountId))
            .limit(1)
            .get();
        });

        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [db]
  );

  return { addIncome, isAdding, error };
};

export const useUpdateIncome = () => {
  const db = useDB();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateIncome = useCallback(
    async (income: UpdateIncomeDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          // Fetch the old income record
          const oldIncome = await tx
            .select({
              accountId: incomes.accountId,
              amount: incomes.amount,
              source: incomes.source,
            })
            .from(incomes)
            .where(eq(incomes.id, income.id))
            .limit(1)
            .get();

          if (!oldIncome) throw new Error("Income record not found");

          // Update the income record
          await tx
            .update(incomes)
            .set({
              accountId: income.accountId,
              source: income.source,
              amount: income.amount,
              date: income.date,
            })
            .where(eq(incomes.id, income.id))
            .run();

          // Adjust balances
          if (oldIncome.accountId === income.accountId) {
            // Same account: adjust balance based on difference
            const difference = income.amount - oldIncome.amount;
            const balanceRow = await tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, income.accountId))
              .limit(1)
              .get();

            const newBalance = (balanceRow?.amount ?? 0) + difference;

            await tx
              .update(balances)
              .set({ amount: newBalance })
              .where(eq(balances.accountId, income.accountId))
              .run();

            const account = await tx
              .select({ name: accounts.name })
              .from(accounts)
              .where(eq(accounts.id, income.accountId))
              .limit(1)
              .get();

            const accountName = account?.name ?? `Account ${income.accountId}`;
          } else {
            // Different accounts: subtract from old, add to new
            const [oldBalanceRow, newBalanceRow] = await Promise.all([
              tx
                .select({ amount: balances.amount })
                .from(balances)
                .where(eq(balances.accountId, oldIncome.accountId))
                .limit(1)
                .get(),
              tx
                .select({ amount: balances.amount })
                .from(balances)
                .where(eq(balances.accountId, income.accountId))
                .limit(1)
                .get(),
            ]);

            const oldNewBalance =
              (oldBalanceRow?.amount ?? 0) - oldIncome.amount;
            const newNewBalance = (newBalanceRow?.amount ?? 0) + income.amount;

            await tx
              .update(balances)
              .set({ amount: oldNewBalance })
              .where(eq(balances.accountId, oldIncome.accountId))
              .run();

            await tx
              .update(balances)
              .set({ amount: newNewBalance })
              .where(eq(balances.accountId, income.accountId))
              .run();

            const [oldAccount, newAccount] = await Promise.all([
              tx
                .select({ name: accounts.name })
                .from(accounts)
                .where(eq(accounts.id, oldIncome.accountId))
                .limit(1)
                .get(),
              tx
                .select({ name: accounts.name })
                .from(accounts)
                .where(eq(accounts.id, income.accountId))
                .limit(1)
                .get(),
            ]);
          }
        });

        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [db]
  );

  return { updateIncome, isUpdating, error };
};

export const useDeleteIncome = () => {
  const db = useDB();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteIncome = useCallback(
    async (id: number) => {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await db.transaction(async (tx) => {
          const income = await tx
            .select({
              id: incomes.id,
              accountId: incomes.accountId,
              amount: incomes.amount,
              source: incomes.source,
            })
            .from(incomes)
            .where(eq(incomes.id, id))
            .limit(1)
            .get();

          if (!income) throw new Error("Income not found");

          await tx.delete(incomes).where(eq(incomes.id, id)).run();

          const balanceRow = await tx
            .select({ amount: balances.amount })
            .from(balances)
            .where(eq(balances.accountId, income.accountId))
            .limit(1)
            .get();

          const currentBalance = balanceRow?.amount ?? 0;
          const newBalance = currentBalance - income.amount;

          await tx
            .update(balances)
            .set({ amount: newBalance })
            .where(eq(balances.accountId, income.accountId))
            .run();

          return true;
        });

        return result;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [db]
  );

  return { deleteIncome, isDeleting, error };
};
