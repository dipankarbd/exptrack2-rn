import React from "react";
import dayjs from "dayjs";
import { List, Text, useTheme } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import { formatAmount } from "@/utils/format";

type Props = {
  type: string;
  amount: number;
  balance: number;
  date: string;
  currencySymbol: string;
  description: string;
  onPress?: () => void;
};

export default function TransactionItemView({
  type,
  amount,
  balance,
  date,
  currencySymbol,
  description,
  onPress,
}: Props) {
  const theme = useTheme();
  const isNegative = amount < 0;

  return (
    <List.Item
      onPress={onPress}
      title={() => (
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
          {type}
        </Text>
      )}
      description={() => (
        <View>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {description}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {dayjs(date).format("YYYY-MM-DD h:mm A")}
          </Text>
        </View>
      )}
      right={() => (
        <View style={styles.rightContainer}>
          <Text
            variant="titleMedium"
            style={[
              styles.amountText,
              {
                color: isNegative ? theme.colors.error : theme.colors.tertiary,
              },
            ]}
          >
            {`${currencySymbol}${formatAmount(amount)}`}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {`Bal: ${currencySymbol}${formatAmount(balance)}`}
          </Text>
        </View>
      )}
      accessibilityLabel={`${type} of ${currencySymbol}${formatAmount(
        amount
      )} on ${dayjs(date).format("MMMM D, YYYY")}`}
    />
  );
}

const styles = StyleSheet.create({
  rightContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 8,
  },
  amountText: {
    marginBottom: 2,
  },
});
