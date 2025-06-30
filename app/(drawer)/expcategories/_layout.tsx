import React from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Icon, useTheme } from "react-native-paper";
import { Pressable } from "react-native-gesture-handler";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function Layout() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Expense Categories",
          headerLeft: () => (
            <View style={{ marginLeft: -16 }}>
              <DrawerToggleButton />
            </View>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push("./expcategories/add");
              }}
            >
              <Icon source="plus" size={24} color={theme.colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "New Category",
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Category",
        }}
      />
    </Stack>
  );
}
