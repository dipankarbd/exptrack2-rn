import React, { Suspense } from "react";
import { ActivityIndicator, StatusBar } from "react-native";

import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { PaperProvider, MD3LightTheme } from "react-native-paper";
import {
  ThemeProvider,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

import { useRunMigration } from "@/hooks/db/migration";
import { DATABASE_NAME } from "@/db";

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
