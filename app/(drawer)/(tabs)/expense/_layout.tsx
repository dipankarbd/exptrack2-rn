import React from "react";
import { Stack } from "expo-router";

import ExpenseHeader from "@/components/expense/ExpenseHeader";

const renderExpenseHeader = (props: any) => <ExpenseHeader {...props} />;

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{ title: "Expense", header: renderExpenseHeader }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "New Expense",
        }}
      />

      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Expense",
        }}
      />
    </Stack>
  );
}
