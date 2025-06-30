import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

type Props = {
  symbol: string;
};

export default function CurrencySymbolView({ symbol }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.symbolContainer,
        { backgroundColor: theme.colors.primaryContainer },
      ]}
    >
      <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
