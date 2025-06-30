import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Divider, IconButton, useTheme } from "react-native-paper";
import ExpenseItemView from "./ExpenseItemView";

type Expense = {
  id: number;
  category: string;
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
  expenses: Expense[];
  onDeleteExpense?: (expenseId: number) => void;
  onPress?: (expenseId: number) => void;
};

export default function ExpenseListView({
  expenses,
  onDeleteExpense,
  onPress,
}: Props) {
  const theme = useTheme();

  const listData = expenses.map((expense) => ({
    key: expense.id.toString(),
    ...expense,
  }));

  const handlePress = (expense: Expense) => onPress?.(expense.id);

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete selected expense from "${expense.category}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteExpense?.(expense.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Expense & { key: string } }) => (
    <View
      style={[
        styles.frontRowContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <ExpenseItemView
        category={item.category}
        amount={item.amount}
        currencySymbol={item.currency.symbol}
        account={item.account.name}
        date={item.date}
        onPress={() => handlePress(item)}
      />
    </View>
  );

  const renderHiddenItem = ({ item }: { item: Expense & { key: string } }) => (
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
