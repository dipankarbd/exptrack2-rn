import React, { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, StatusBar } from "react-native";

import { Stack, useRouter, usePathname } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { PaperProvider, MD3LightTheme } from "react-native-paper";
import {
  ThemeProvider,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

import { useRunMigration } from "@/hooks/db/migration";
import { DATABASE_NAME } from "@/db";
import { getPassword } from "@/lib/password";

function MigrationRunner() {
  useRunMigration();
  return null;
}

export default function RootLayout() {
  const paperTheme = {
    ...MD3LightTheme,
  };

  const navigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      primary: paperTheme.colors.primary,
    },
  };

  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const saved = await getPassword();

        if (saved && pathname !== "/password") {
          router.replace("/password");
        }
      } catch (err) {
        console.error("Failed to check password:", err);
      } finally {
        setChecking(false);
      }
    };

    checkPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={DATABASE_NAME} useSuspense>
        <MigrationRunner />
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={paperTheme.colors.primary}
            />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(drawer)" />
            </Stack>
          </ThemeProvider>
        </PaperProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
