import React from "react";
import { Stack } from "expo-router";

import TransferHeader from "@/components/transfer/TransferHeader";

const renderTransferHeader = (props: any) => <TransferHeader {...props} />;

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{ title: "Transfer", header: renderTransferHeader }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "New Transfer",
        }}
      />

      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Transfer",
        }}
      />
    </Stack>
  );
}
