import dayjs from "dayjs";
import React from "react";
import { List, Text, useTheme } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import { formatAmount } from "@/utils/format";

type Props = {
  source: string;
  amount: number;
  currencySymbol: string;
  date: string;
  account: string;
  onPress?: () => void;
};

export default function IncomeItemView({
  source,
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
            {source}
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
          <View style={styles.amountRow}>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "500",
                color: theme.colors.tertiary,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {`${currencySymbol}${formatAmount(amount)}`}
            </Text>
          </View>
        </View>
      )}
      accessibilityLabel={`Income from ${source} of ${currencySymbol}${formatAmount(
        amount
      )} on ${dayjs(date).format("MMMM D, YYYY")}`}
    />
  );
}

const styles = StyleSheet.create({
  amountWrapper: {
    minWidth: 100,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
});
