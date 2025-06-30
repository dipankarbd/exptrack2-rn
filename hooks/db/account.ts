import { asc, eq, or } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";

import {
  Account,
  accounts,
  AccountState,
  AccountType,
  balances,
  currencies,
  expenses,
  incomes,
  transfers,
} from "@/db/schema";
import { useDB } from ".";

type AddAccountDto = {
  name: string;
  type: AccountType;
  state: AccountState;
  currencyId: number;
};

type UpdateAccountDto = AddAccountDto & {
  id: number;
};

type AccountItem = Account & {
  currency: {
    code: string;
    symbol: string;
    description: string;
  };
  balance: number;
};

export const useAccounts = () => {
  const db = useDB();
  const [data, setData] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accountsResult = await db
        .select({
          id: accounts.id,
          type: accounts.type,
          state: accounts.state,
          name: accounts.name,
          currencyId: accounts.currencyId,
          balance: balances.amount,
          createdAt: accounts.createdAt,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
        })
        .from(accounts)
        .innerJoin(balances, eq(accounts.id, balances.accountId))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .orderBy(asc(accounts.id));

      setData(accountsResult);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { data, loading, error, refetch: fetchAccounts };
};

export const useAccountById = (id: number) => {
  const db = useDB();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1)
        .all();

      setAccount(result[0] || null);
    };

    fetch();
  }, [id]);

  return account;
};

export const useAccountWithCurrencyById = (id: number) => {
  const db = useDB();
  const [account, setAccount] = useState<AccountItem | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await db
        .select({
          id: accounts.id,
          type: accounts.type,
          state: accounts.state,
          name: accounts.name,
          currencyId: accounts.currencyId,
          balance: balances.amount,
          createdAt: accounts.createdAt,
          currency: {
            code: currencies.code,
            symbol: currencies.symbol,
            description: currencies.description,
          },
        })
        .from(accounts)
        .innerJoin(balances, eq(accounts.id, balances.accountId))
        .innerJoin(currencies, eq(accounts.currencyId, currencies.id))
        .where(eq(accounts.id, id))
        .limit(1)
        .all();

      setAccount(result[0] || null);
    };

    fetch();
  }, [id]);

  return account;
};

export const useAddAccount = () => {
  const db = useDB();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addAccount = useCallback(
    async (account: AddAccountDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.transaction(async (tx) => {
          const result = await tx
            .insert(accounts)
            .values(account)
            .returning({ id: accounts.id })
            .get();

          const accountId = result.id;

          await tx
            .insert(balances)
            .values({
              accountId,
              amount: 0,
            })
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

  return { addAccount, isAdding, error };
};

export const useUpdateAccount = () => {
  const db = useDB();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAccount = useCallback(
    async ({ id, ...updates }: UpdateAccountDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db.update(accounts).set(updates).where(eq(accounts.id, id)).run();
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

  return { updateAccount, isUpdating, error };
};

export function useDeleteAccount() {
  const db = useDB();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAccount = useCallback(
    async (accountId: number) => {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await db.transaction(async (tx) => {
          const isUsedInIncomes = await tx
            .select()
            .from(incomes)
            .where(eq(incomes.accountId, accountId))
            .limit(1)
            .get();

          const isUsedInExpenses = await tx
            .select()
            .from(expenses)
            .where(eq(expenses.accountId, accountId))
            .limit(1)
            .get();

          const isUsedInTransfers = await tx
            .select()
            .from(transfers)
            .where(
              or(
                eq(transfers.fromAccountId, accountId),
                eq(transfers.toAccountId, accountId)
              )
            )
            .limit(1)
            .get();

          if (isUsedInIncomes || isUsedInExpenses || isUsedInTransfers) {
            throw new Error(
              "Account is used in transactions and cannot be deleted."
            );
          }

          await tx
            .delete(balances)
            .where(eq(balances.accountId, accountId))
            .run();

          await tx.delete(accounts).where(eq(accounts.id, accountId)).run();

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

  return { deleteAccount, isDeleting, error };
}
