import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Divider, IconButton, useTheme } from "react-native-paper";

import IncomeItemView from "./IncomeItemView";

type Income = {
  id: number;
  source: string;
  amount: number;
  currency: {
    symbol: string;
  };
  account: {
    name: string;
  };
  date: string;
};

type Props = {
  incomes: Income[];
  onDeleteIncome?: (incomeId: number) => void;
  onPress?: (incomeId: number) => void;
};

export default function IncomeListView({
  incomes,
  onDeleteIncome,
  onPress,
}: Props) {
  const theme = useTheme();

  const listData = useMemo(
    () =>
      incomes.map((income) => ({
        key: income.id.toString(),
        ...income,
      })),
    [incomes]
  );

  const handlePress = useCallback(
    (income: Income) => onPress?.(income.id),
    [onPress]
  );

  const handleDelete = useCallback(
    (income: Income) => {
      Alert.alert(
        "Delete Income",
        `Are you sure you want to delete selected income from "${income.source}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDeleteIncome?.(income.id),
          },
        ]
      );
    },
    [onDeleteIncome]
  );

  const renderItem = useCallback(
    ({ item }: { item: Income & { key: string } }) => (
      <View
        style={[
          styles.frontRowContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <IncomeItemView
          source={item.source}
          amount={item.amount}
          currencySymbol={item.currency.symbol}
          account={item.account.name}
          date={item.date}
          onPress={() => handlePress(item)}
        />
      </View>
    ),
    [theme.colors.surface, handlePress]
  );

  const renderHiddenItem = useCallback(
    ({ item }: { item: Income & { key: string } }) => (
      <View style={styles.hiddenItemContainer}>
        <View style={styles.hiddenItemLeft}></View>
        <View
          style={[
            styles.hiddenItemRight,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <IconButton
            icon="delete"
            iconColor={theme.colors.onErrorContainer}
            size={24}
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          />
        </View>
      </View>
    ),
    [theme.colors.errorContainer, theme.colors.onErrorContainer, handleDelete]
  );

  return (
    <SwipeListView
      data={listData}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-75}
      leftOpenValue={0}
      disableRightSwipe={true}
      ItemSeparatorComponent={Divider}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => item.key}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  frontRowContainer: {
    flex: 1,
  },
  hiddenItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hiddenItemLeft: {
    flex: 1,
  },
  hiddenItemRight: {
    width: 75,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    margin: 0,
  },
});
