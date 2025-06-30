import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="expense"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="expense"
        options={{
          tabBarLabel: "Expense",
          title: "Expense",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          tabBarLabel: "Transfer",
          title: "Transfer",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="transfer" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          tabBarLabel: "Income",
          title: "Income",

          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash" size={32} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
