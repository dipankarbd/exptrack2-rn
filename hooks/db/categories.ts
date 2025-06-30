import { asc, eq, sql } from "drizzle-orm";
import { useCallback, useEffect, useMemo, useState } from "react";

import { expenseCategories, ExpenseCategory, expenses } from "@/db/schema";
import { useDB } from ".";

export type AddCategoryDto = {
  name: string;
  parentId: number | null;
};

export type UpdateCategoryDto = AddCategoryDto & {
  id: number;
};

export const useCategories = () => {
  const db = useDB();

  const [data, setData] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select()
        .from(expenseCategories)
        .orderBy(asc(expenseCategories.id));

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    data,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export const useAddCategory = () => {
  const db = useDB();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addCategory = useCallback(
    async (category: AddCategoryDto) => {
      setIsAdding(true);
      setError(null);

      try {
        await db.insert(expenseCategories).values(category).run();
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

  return {
    addCategory,
    isAdding,
    error,
  };
};

export const useCategoryById = (id: number) => {
  const db = useDB();

  const [data, setData] = useState<ExpenseCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetch = async () => {
      try {
        const result = await db
          .select()
          .from(expenseCategories)
          .where(eq(expenseCategories.id, id))
          .limit(1)
          .all();

        setData(result[0] || null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id, db]);

  return { data, loading, error };
};

export const useExpenseCategoryName = (categoryId: number | null) => {
  const { data: categories, loading, error } = useCategories();

  const resolveCategoryName = useMemo(() => {
    if (loading || !categoryId || categories.length === 0) return null;

    const buildName = (id: number): string => {
      const category = categories.find((cat) => cat.id === id);
      if (!category) return "Unknown";

      if (category.parentId) {
        const parentName = buildName(category.parentId);
        return `${parentName} - ${category.name}`;
      }

      return category.name;
    };

    return buildName(categoryId);
  }, [categoryId, categories, loading]);

  return {
    name: resolveCategoryName,
    loading,
    error,
  };
};

export const useUpdateCategory = () => {
  const db = useDB();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCategory = useCallback(
    async ({ id, ...updates }: UpdateCategoryDto) => {
      setIsUpdating(true);
      setError(null);

      try {
        await db
          .update(expenseCategories)
          .set(updates)
          .where(eq(expenseCategories.id, id))
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

  return { updateCategory, isUpdating, error };
};

export const useDeleteCategory = () => {
  const db = useDB();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteCategory = async (id: number) => {
    setIsDeleting(true);
    setError(null);

    try {
      // Check if category is used in expenses
      const expenseRef = await db
        .select({ count: sql<number>`count(*)` })
        .from(expenses)
        .where(eq(expenses.categoryId, id))
        .get();

      if ((expenseRef?.count ?? 0) > 0) {
        throw new Error(
          "Cannot delete category: it is used by one or more expenses."
        );
      }

      // Check if category is parent of other categories
      const childCategoryRef = await db
        .select({ count: sql<number>`count(*)` })
        .from(expenseCategories)
        .where(eq(expenseCategories.parentId, id))
        .get();

      if ((childCategoryRef?.count ?? 0) > 0) {
        throw new Error(
          "Cannot delete category: it has one or more sub-categories."
        );
      }

      // Safe to delete
      await db
        .delete(expenseCategories)
        .where(eq(expenseCategories.id, id))
        .run();

      setIsDeleting(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setIsDeleting(false);
      return false;
    }
  };

  return {
    deleteCategory,
    isDeleting,
    error,
  };
};
