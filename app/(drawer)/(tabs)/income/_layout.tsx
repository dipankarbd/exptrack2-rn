import React from "react";
import { Stack } from "expo-router";

import IncomeHeader from "@/components/income/IncomeHeader";

const renderIncomeHeader = (props: any) => <IncomeHeader {...props} />;

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{ title: "Income", header: renderIncomeHeader }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "New Income",
        }}
      />

      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Income",
        }}
      />
    </Stack>
  );
}
