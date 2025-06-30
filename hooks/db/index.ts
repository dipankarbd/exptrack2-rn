import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export const useDB = () => {
  const sqliteDB = useSQLiteContext();
  return useMemo(() => drizzle(sqliteDB), [sqliteDB]);
};
