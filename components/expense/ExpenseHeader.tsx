import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ExpenseHeader({
  route,
  options,
}: NativeStackHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const title = options.title ?? route.name;

  const backgroundColor = theme.colors.primary;
  const iconColor = theme.colors.onPrimary ?? "white";

  const handleAddPress = useCallback(() => {
    router.push("/(drawer)/(tabs)/expense/add");
  }, [router]);

  const renderAddIcon = useCallback(
    ({ size }: { size: number }) => (
      <MaterialCommunityIcons name="plus" size={size} color={iconColor} />
    ),
    [iconColor]
  );

  return (
    <Appbar.Header style={[styles.header, { backgroundColor }]}>
      <DrawerToggleButton tintColor={iconColor} />
      <Appbar.Content
        title={title}
        titleStyle={[styles.title, { color: iconColor }]}
      />
      <Appbar.Action icon={renderAddIcon} onPress={handleAddPress} />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
  },
});
