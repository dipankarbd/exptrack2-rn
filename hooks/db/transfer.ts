import { accounts, balances, currencies, transfers } from "@/db/schema";
import { desc, eq, inArray, sql, SQL } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import { useDB } from ".";

type TransferItem = {
  id: number;
  fromAccount: {
    id: number;
    name: string;
    type: string;
    currency: {
      code: string;
      symbol: string;
      description: string;
    };
  };
  toAccount: {
    id: number;
    name: string;
    type: string;
    currency: {
      code: string;
      symbol: string;
      description: string;
    };
  };
  amount: number;
  conversionRate: number;
  date: string;
};

type AddTransferDto = {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  conversionRate: number;
  date: string;
};

type UpdateTransferDto = AddTransferDto & {
  id: number;
};

export const useTransfers = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const db = useDB();
  const [data, setData] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let condition: SQL = sql`1 = 1`;

      if (startDate && endDate) {
        condition = sql`${transfers.date} >= ${startDate} AND ${transfers.date} <= ${endDate}`;
      } else if (startDate) {
        condition = sql`${transfers.date} >= ${startDate}`;
      } else if (endDate) {
        condition = sql`${transfers.date} <= ${endDate}`;
      } else {
        setData([]);
        return;
      }

      const rawTransfers = await db
        .select()
        .from(transfers)
        .where(condition)
        .orderBy(desc(transfers.date));

      const accountIds = Array.from(
        new Set(rawTransfers.flatMap((t) => [t.fromAccountId, t.toAccountId]))
      );

      const accountRows = await db
        .select({
          id: accounts.id,
          name: accounts.name,
          type: accounts.type,
          currencyId: accounts.currencyId,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
        })
        .from(accounts)
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(inArray(accounts.id, accountIds));

      const accountMap = new Map<number, (typeof accountRows)[number]>();
      accountRows.forEach((acc) => accountMap.set(acc.id, acc));

      const result: TransferItem[] = rawTransfers.map((t) => ({
        ...t,
        fromAccount: accountMap.get(t.fromAccountId)!,
        toAccount: accountMap.get(t.toAccountId)!,
      }));

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, startDate, endDate]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransfers,
  };
};

export const useTransferById = (id: number) => {
  const db = useDB();

  const [data, setData] = useState<TransferItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const transfer = await db
        .select()
        .from(transfers)
        .where(eq(transfers.id, id))
        .limit(1)
        .get();

      if (!transfer) {
        setData(null);
        return;
      }

      const accountIds = [transfer.fromAccountId, transfer.toAccountId];

      const accountRows = await db
        .select({
          id: accounts.id,
          name: accounts.name,
          type: accounts.type,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
        })
        .from(accounts)
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(inArray(accounts.id, accountIds));

      const accountMap = new Map<number, (typeof accountRows)[number]>();
      accountRows.forEach((acc) => accountMap.set(acc.id, acc));

      const result: TransferItem = {
        id: transfer.id,
        amount: transfer.amount,
        conversionRate: transfer.conversionRate,
        date: transfer.date,
        fromAccount: accountMap.get(transfer.fromAccountId)!,
        toAccount: accountMap.get(transfer.toAccountId)!,
      };

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    fetchTransfer();
  }, [fetchTransfer]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransfer,
  };
};

export const useAddTransfer = () => {
  const db = useDB();

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addTransfer = useCallback(
    async (transfer: AddTransferDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          const { fromAccountId, toAccountId, amount, conversionRate, date } =
            transfer;

          await tx.insert(transfers).values(transfer).run();

          const [fromBalanceRow, toBalanceRow] = await Promise.all([
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, fromAccountId))
              .limit(1)
              .get(),

            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, toAccountId))
              .limit(1)
              .get(),
          ]);

          const fromBalance = fromBalanceRow?.amount ?? 0;
          const toBalance = toBalanceRow?.amount ?? 0;

          const newFromBalance = fromBalance - amount;
          const receivedAmount = amount * conversionRate;
          const newToBalance = toBalance + receivedAmount;

          await Promise.all([
            tx
              .update(balances)
              .set({ amount: newFromBalance })
              .where(eq(balances.accountId, fromAccountId))
              .run(),

            tx
              .update(balances)
              .set({ amount: newToBalance })
              .where(eq(balances.accountId, toAccountId))
              .run(),
          ]);

          const [fromAccount, toAccount] = await Promise.all([
            tx
              .select({ name: accounts.name })
              .from(accounts)
              .where(eq(accounts.id, fromAccountId))
              .limit(1)
              .get(),

            tx
              .select({ name: accounts.name })
              .from(accounts)
              .where(eq(accounts.id, toAccountId))
              .limit(1)
              .get(),
          ]);

          const fromName = fromAccount?.name ?? `Account ${fromAccountId}`;
          const toName = toAccount?.name ?? `Account ${toAccountId}`;
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

  return { addTransfer, isAdding, error };
};

export const useUpdateTransfer = () => {
  const db = useDB();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTransfer = useCallback(
    async (transfer: UpdateTransferDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          const oldTransfer = await tx
            .select()
            .from(transfers)
            .where(eq(transfers.id, transfer.id))
            .limit(1)
            .get();

          if (!oldTransfer) throw new Error("Transfer not found");

          const {
            fromAccountId: oldFromId,
            toAccountId: oldToId,
            amount: oldAmount,
            conversionRate: oldRate,
          } = oldTransfer;

          const {
            fromAccountId: newFromId,
            toAccountId: newToId,
            amount: newAmount,
            conversionRate: newRate,
            date,
          } = transfer;

          // Reverse the old transfer
          const [oldFromBalanceRow, oldToBalanceRow] = await Promise.all([
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, oldFromId))
              .limit(1)
              .get(),
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, oldToId))
              .limit(1)
              .get(),
          ]);

          const restoredFromBalance =
            (oldFromBalanceRow?.amount ?? 0) + oldAmount;
          const reversedToAmount = oldAmount * oldRate;
          const restoredToBalance =
            (oldToBalanceRow?.amount ?? 0) - reversedToAmount;

          await Promise.all([
            tx
              .update(balances)
              .set({ amount: restoredFromBalance })
              .where(eq(balances.accountId, oldFromId))
              .run(),
            tx
              .update(balances)
              .set({ amount: restoredToBalance })
              .where(eq(balances.accountId, oldToId))
              .run(),
          ]);

          // Apply the new transfer
          const [newFromBalanceRow, newToBalanceRow] = await Promise.all([
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, newFromId))
              .limit(1)
              .get(),
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, newToId))
              .limit(1)
              .get(),
          ]);

          const newFromBalance = (newFromBalanceRow?.amount ?? 0) - newAmount;
          const newReceivedAmount = newAmount * newRate;
          const newToBalance =
            (newToBalanceRow?.amount ?? 0) + newReceivedAmount;

          await Promise.all([
            tx
              .update(balances)
              .set({ amount: newFromBalance })
              .where(eq(balances.accountId, newFromId))
              .run(),
            tx
              .update(balances)
              .set({ amount: newToBalance })
              .where(eq(balances.accountId, newToId))
              .run(),
          ]);

          // Update transfer record
          await tx
            .update(transfers)
            .set({
              fromAccountId: newFromId,
              toAccountId: newToId,
              amount: newAmount,
              conversionRate: newRate,
              date,
            })
            .where(eq(transfers.id, transfer.id))
            .run();
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

  return { updateTransfer, isUpdating, error };
};

export const useDeleteTransfer = () => {
  const db = useDB();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTransfer = useCallback(
    async (id: number) => {
      setIsDeleting(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          const transfer = await tx
            .select({
              id: transfers.id,
              fromAccountId: transfers.fromAccountId,
              toAccountId: transfers.toAccountId,
              amount: transfers.amount,
              conversionRate: transfers.conversionRate,
              date: transfers.date,
            })
            .from(transfers)
            .where(eq(transfers.id, id))
            .limit(1)
            .get();

          if (!transfer) throw new Error("Transfer not found");

          const { fromAccountId, toAccountId, amount, conversionRate } =
            transfer;

          await tx.delete(transfers).where(eq(transfers.id, id)).run();

          const [fromBalanceRow, toBalanceRow] = await Promise.all([
            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, fromAccountId))
              .limit(1)
              .get(),

            tx
              .select({ amount: balances.amount })
              .from(balances)
              .where(eq(balances.accountId, toAccountId))
              .limit(1)
              .get(),
          ]);

          const fromBalance = fromBalanceRow?.amount ?? 0;
          const toBalance = toBalanceRow?.amount ?? 0;

          const receivedAmount = amount * conversionRate;
          const newFromBalance = fromBalance + amount;
          const newToBalance = toBalance - receivedAmount;

          await Promise.all([
            tx
              .update(balances)
              .set({ amount: newFromBalance })
              .where(eq(balances.accountId, fromAccountId))
              .run(),

            tx
              .update(balances)
              .set({ amount: newToBalance })
              .where(eq(balances.accountId, toAccountId))
              .run(),
          ]);
        });

        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [db]
  );

  return { deleteTransfer, isDeleting, error };
};
