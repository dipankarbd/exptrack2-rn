import React from "react";
import { View, StyleSheet } from "react-native";
import { Icon, useTheme } from "react-native-paper";

type AccountType = "Bank" | "Cash" | "CreditCard";

const typeIcons: Record<AccountType, string> = {
  Bank: "bank",
  Cash: "cash",
  CreditCard: "credit-card",
};

type Props = {
  type: AccountType;
};

export default function AccountIconView({ type }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: theme.colors.secondaryContainer },
      ]}
    >
      <Icon
        source={typeIcons[type] || "folder"}
        color={theme.colors.onSecondaryContainer}
        size={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
