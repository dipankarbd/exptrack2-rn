import { accounts, currencies, Currency } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

import { useCallback, useEffect, useState } from "react";
import { useDB } from ".";

type AddCurrencyDto = {
  symbol: string;
  code: string;
  description: string;
};

type UpdateCurrencyDto = {
  id: number;
  symbol: string;
  code: string;
  description: string;
};

export const useCurrencies = () => {
  const db = useDB();

  const [data, setData] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select()
        .from(currencies)
        .orderBy(asc(currencies.id));

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchCurrencies,
  };
};

export const useCurrencyById = (id: number) => {
  const db = useDB();

  const [currency, setCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await db
        .select()
        .from(currencies)
        .where(eq(currencies.id, id))
        .limit(1)
        .all();

      setCurrency(result[0] || null);
    };

    fetch();
  }, [id]);

  return currency;
};

export const useAddCurrency = () => {
  const db = useDB();

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addCurrency = useCallback(
    async (currency: AddCurrencyDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.insert(currencies).values(currency).run();
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

  return { addCurrency, isAdding, error };
};

export const useUpdateCurrency = () => {
  const db = useDB();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCurrency = useCallback(
    async ({ id, ...updates }: UpdateCurrencyDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db
          .update(currencies)
          .set(updates)
          .where(eq(currencies.id, id))
          .run();
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

  return { updateCurrency, isUpdating, error };
};

export const useDeleteCurrency = () => {
  const db = useDB();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteCurrency = async (id: number) => {
    try {
      setIsDeleting(true);
      setError(null);

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(accounts)
        .where(eq(accounts.currencyId, id))
        .get();

      const count = result?.count ?? 0;

      if (count > 0) {
        throw new Error(
          "Cannot delete currency: it is used by one or more accounts."
        );
      }

      await db.delete(currencies).where(eq(currencies.id, id)).run();

      setIsDeleting(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setIsDeleting(false);
      return false;
    }
  };

  return { deleteCurrency, error, isDeleting };
};
