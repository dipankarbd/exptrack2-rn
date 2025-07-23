import dayjs from "dayjs";
import React from "react";
import { List, Text, useTheme } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import { formatAmount } from "@/utils/format";

type Props = {
  category: string;
  amount: number;
  currencySymbol: string;
  date: string;
  account: string;
  onPress?: () => void;
};

export default function ExpenseItemView({
  category,
  amount,
  currencySymbol,
  date,
  account,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <List.Item
      onPress={onPress}
      title={() => (
        <View>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {category}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {account}
          </Text>
        </View>
      )}
      description={() => (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {dayjs(date).format("YYYY-MM-DD h:mm A")}
        </Text>
      )}
      right={() => (
        <View style={styles.amountWrapper}>
          <Text
            variant="titleMedium"
            style={[styles.amount, { color: theme.colors.error }]}
          >
            {`${currencySymbol}${formatAmount(amount)}`}
          </Text>
        </View>
      )}
      accessibilityLabel={`Expense for ${category} of ${currencySymbol}${formatAmount(
        amount
      )} on ${dayjs(date).format("MMMM D, YYYY")}`}
    />
  );
}

const styles = StyleSheet.create({
  amountWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 8,
  },
  amount: {
    textAlign: "right",
  },
});
