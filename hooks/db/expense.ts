import { desc, eq, sql, SQL } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";

import { accounts, balances, currencies, Expense, expenses } from "@/db/schema";
import { useDB } from ".";

type AddExpenseDto = {
  accountId: number;
  categoryId: number;
  amount: number;
  date: string;
};

type UpdateExpenseDto = AddExpenseDto & {
  id: number;
};

type ExpenseItem = Expense & {
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

export const useExpenses = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const db = useDB();

  const [data, setData] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let condition: SQL = sql`1 = 1`;

      if (startDate && endDate) {
        condition = sql`${expenses.date} >= ${startDate} AND ${expenses.date} <= ${endDate}`;
      } else if (startDate) {
        condition = sql`${expenses.date} >= ${startDate}`;
      } else if (endDate) {
        condition = sql`${expenses.date} <= ${endDate}`;
      } else {
        setData([]);
        return;
      }

      const result = await db
        .select({
          id: expenses.id,
          accountId: expenses.accountId,
          categoryId: expenses.categoryId,
          amount: expenses.amount,
          date: expenses.date,
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
        .from(expenses)
        .innerJoin(accounts, eq(expenses.accountId, accounts.id))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(condition)
        .orderBy(desc(expenses.date));

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    data,
    loading,
    error,
    refetch: fetchExpenses,
  };
};

export const useExpenseById = (id: number) => {
  const db = useDB();

  const [data, setData] = useState<ExpenseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select({
          id: expenses.id,
          accountId: expenses.accountId,
          categoryId: expenses.categoryId,
          amount: expenses.amount,
          date: expenses.date,
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
        .from(expenses)
        .innerJoin(accounts, eq(expenses.accountId, accounts.id))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(eq(expenses.id, id))
        .limit(1)
        .get();

      setData(result ?? null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    if (id) fetchExpense();
  }, [fetchExpense]);

  return { data, loading, error, refetch: fetchExpense };
};

export const useAddExpense = () => {
  const db = useDB();

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addExpense = useCallback(
    async (expense: AddExpenseDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          await tx.insert(expenses).values(expense).run();

          const balanceRow = await tx
            .select({ amount: balances.amount })
            .from(balances)
            .where(eq(balances.accountId, expense.accountId))
            .limit(1)
            .get();

          const currentBalance = balanceRow?.amount ?? 0;
          const newBalance = currentBalance - expense.amount;

          await tx
            .update(balances)
            .set({ amount: newBalance })
            .where(eq(balances.accountId, expense.accountId))
            .run();
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

  return { addExpense, isAdding, error };
};

export const useUpdateExpense = () => {
  const db = useDB();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateExpense = useCallback(
    async (expense: UpdateExpenseDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          // Fetch the old expense record
          const oldExpense = await tx
            .select({
              accountId: expenses.accountId,
              amount: expenses.amount,
              categoryId: expenses.categoryId,
            })
            .from(expenses)
            .where(eq(expenses.id, expense.id))
            .limit(1)
            .get();

          if (!oldExpense) throw new Error("Expense record not found");

          // Update the expense record
          await tx
            .update(expenses)
            .set({
              accountId: expense.accountId,
              categoryId: expense.categoryId,
              amount: expense.amount,
              date: expense.date,
            })
            .where(eq(expenses.id, expense.id))
            .run();

          if (oldExpense.accountId === expense.accountId) {
            // Same account: update balance by amount difference
            const difference = oldExpense.amount - expense.amount;

            const balanceRow = await tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, expense.accountId))
              .limit(1)
              .get();

            const newBalance = (balanceRow?.amount ?? 0) + difference;

            await tx
              .update(balances)
              .set({ amount: newBalance })
              .where(eq(balances.accountId, expense.accountId))
              .run();
          } else {
            // Different accounts: reverse old expense, apply new expense

            const [oldBalanceRow, newBalanceRow] = await Promise.all([
              tx
                .select({ amount: balances.amount })
                .from(balances)
                .where(eq(balances.accountId, oldExpense.accountId))
                .limit(1)
                .get(),
              tx
                .select({ amount: balances.amount })
                .from(balances)
                .where(eq(balances.accountId, expense.accountId))
                .limit(1)
                .get(),
            ]);

            const oldNewBalance =
              (oldBalanceRow?.amount ?? 0) + oldExpense.amount;
            const newNewBalance = (newBalanceRow?.amount ?? 0) - expense.amount;

            await Promise.all([
              tx
                .update(balances)
                .set({ amount: oldNewBalance })
                .where(eq(balances.accountId, oldExpense.accountId))
                .run(),
              tx
                .update(balances)
                .set({ amount: newNewBalance })
                .where(eq(balances.accountId, expense.accountId))
                .run(),
            ]);

            const [oldAccount, newAccount] = await Promise.all([
              tx
                .select({ name: accounts.name })
                .from(accounts)
                .where(eq(accounts.id, oldExpense.accountId))
                .limit(1)
                .get(),
              tx
                .select({ name: accounts.name })
                .from(accounts)
                .where(eq(accounts.id, expense.accountId))
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

  return { updateExpense, isUpdating, error };
};

export const useDeleteExpense = () => {
  const db = useDB();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteExpense = useCallback(
    async (id: number) => {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await db.transaction(async (tx) => {
          const expense = await tx
            .select({
              id: expenses.id,
              accountId: expenses.accountId,
              amount: expenses.amount,
              categoryId: expenses.categoryId,
            })
            .from(expenses)
            .where(eq(expenses.id, id))
            .limit(1)
            .get();

          if (!expense) throw new Error("Expense not found");

          await tx.delete(expenses).where(eq(expenses.id, id)).run();

          const balanceRow = await tx
            .select({ amount: balances.amount })
            .from(balances)
            .where(eq(balances.accountId, expense.accountId))
            .limit(1)
            .get();

          const currentBalance = balanceRow?.amount ?? 0;
          const newBalance = currentBalance + expense.amount;

          await tx
            .update(balances)
            .set({ amount: newBalance })
            .where(eq(balances.accountId, expense.accountId))
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

  return { deleteExpense, isDeleting, error };
};
