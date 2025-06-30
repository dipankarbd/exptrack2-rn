import dayjs from "dayjs";
import React from "react";
import { View, StyleSheet } from "react-native";
import { List, Text, useTheme } from "react-native-paper";

import { formatAmount } from "@/utils/format";

type Props = {
  amount: number;
  conversionRate: number;
  fromAccount: {
    name: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  toAccount: {
    name: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  date: string;
  onPress?: () => void;
};

export default function TransferItemView({
  amount,
  conversionRate,
  fromAccount,
  toAccount,
  date,
  onPress,
}: Props) {
  const theme = useTheme();

  const toAmount = amount * conversionRate;

  return (
    <List.Item
      onPress={onPress}
      title={() => (
        <View>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {fromAccount.name} → {toAccount.name}
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
        <View style={styles.amountContainer}>
          <Text
            variant="titleMedium"
            style={[styles.amount, { color: theme.colors.primary }]}
          >
            {`${fromAccount.currency.symbol}${formatAmount(amount)}`}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.convertedAmount,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {`→ ${toAccount.currency.symbol}${formatAmount(toAmount)}`}
          </Text>
        </View>
      )}
      accessibilityLabel={`Transfer from ${fromAccount.name} to ${
        toAccount.name
      } of ${fromAccount.currency.symbol}${formatAmount(amount)} on ${dayjs(
        date
      ).format("MMMM D, YYYY")}`}
    />
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  amount: {
    textAlign: "right",
  },
  convertedAmount: {
    textAlign: "right",
  },
});
