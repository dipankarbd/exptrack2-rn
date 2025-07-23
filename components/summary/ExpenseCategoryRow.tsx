import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

type Props = {
  categoryName: string;
  amount: number;
  symbol: string;
};

export default function ExpenseCategoryRow({ categoryName, amount, symbol }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.category, { color: colors.onSurface }]}>
        {categoryName}
      </Text>
      <Text style={[styles.amount, { color: colors.error }]}>
        {symbol}
        {amount.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  category: {
    fontSize: 15,
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
