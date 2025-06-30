import React from "react";
import { List, Text, useTheme } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import AccountIconView from "./AccountIconView";

import { formatAmount } from "@/utils/format";

type Props = {
  name: string;
  type: "Bank" | "Cash" | "CreditCard";
  state: "Active" | "Inactive" | "Closed";
  currency: string;
  balance: number;
  onPress?: () => void;
};

export default function AccountItemView({
  name,
  type,
  state,
  balance,
  currency,
  onPress,
}: Props) {
  const theme = useTheme();

  const description = state === "Active" ? type : `${type} (${state})`;
  const isNegative = balance < 0;

  return (
    <List.Item
      onPress={onPress}
      title={name}
      description={description}
      titleStyle={{ color: theme.colors.onSurface }}
      descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
      left={() => <AccountIconView type={type} />}
      right={() => (
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "500",
                color: isNegative ? theme.colors.error : theme.colors.tertiary,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatAmount(balance)}
            </Text>
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginLeft: 4,
              }}
              numberOfLines={1}
            >
              {currency}
            </Text>
          </View>
        </View>
      )}
      accessibilityLabel={`${name} account with balance ${formatAmount(
        balance
      )} ${currency}`}
    />
  );
}

const styles = StyleSheet.create({
  balanceContainer: {
    minWidth: 100,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
});
