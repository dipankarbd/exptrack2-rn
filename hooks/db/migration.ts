import { useEffect } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "@/drizzle/migrations";
import { seedDatabase } from "@/db/seed";
import { useDB } from ".";

export const useRunMigration = () => {
  const db = useDB();

  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) {
      console.error("Migration failed:", error);
    } else if (success) {
      console.log("Migration success:", success);
      seedDatabase(db);
    }
  }, [success, error, db]);
};
