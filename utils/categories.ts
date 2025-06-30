import { ExpenseCategory } from "@/db/schema";

export const getAllExpenseCategoryNames = (
  categories: ExpenseCategory[]
): Record<number, string> => {
  const categoryMap = new Map<number, ExpenseCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const nameCache = new Map<number, string>();

  const buildFullName = (id: number): string => {
    if (nameCache.has(id)) return nameCache.get(id)!;

    const category = categoryMap.get(id);
    if (!category) return "Unknown";

    let fullName: string;
    if (category.parentId) {
      const parentName = buildFullName(category.parentId);
      fullName = `${parentName} - ${category.name}`;
    } else {
      fullName = category.name;
    }

    nameCache.set(id, fullName);
    return fullName;
  };

  const result: Record<number, string> = {};
  for (const category of categories) {
    result[category.id] = buildFullName(category.id);
  }

  return result;
};
