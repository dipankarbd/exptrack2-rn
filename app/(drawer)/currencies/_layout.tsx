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
          title: "Currencies",
          headerLeft: () => (
            <View style={{ marginLeft: -16 }}>
              <DrawerToggleButton />
            </View>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push("./currencies/add");
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
          title: "New Currency",
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Edit Currency",
        }}
      />
    </Stack>
  );
}
