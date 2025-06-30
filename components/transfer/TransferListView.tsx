import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Divider, IconButton, useTheme } from "react-native-paper";

import TransferItemView from "./TransferItemView";

type Transfer = {
  id: number;
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
  amount: number;
  conversionRate: number;
  date: string;
};

type Props = {
  transfers: Transfer[];
  onDeleteTransfer?: (transferId: number) => void;
  onPress?: (transferId: number) => void;
};

export default function TransferListView({
  transfers,
  onDeleteTransfer,
  onPress,
}: Props) {
  const theme = useTheme();

  const listData = useMemo(
    () =>
      transfers.map((transfer) => ({
        key: transfer.id.toString(),
        ...transfer,
      })),
    [transfers]
  );

  const handlePress = useCallback(
    (transfer: Transfer) => {
      onPress?.(transfer.id);
    },
    [onPress]
  );

  const handleDelete = useCallback(
    (transfer: Transfer) => {
      Alert.alert(
        "Delete Transfer",
        `Delete transfer from "${transfer.fromAccount.name}" to "${transfer.toAccount.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDeleteTransfer?.(transfer.id),
          },
        ]
      );
    },
    [onDeleteTransfer]
  );

  const renderItem = useCallback(
    ({ item }: { item: Transfer & { key: string } }) => (
      <View
        style={[
          styles.frontRowContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TransferItemView
          amount={item.amount}
          conversionRate={item.conversionRate}
          fromAccount={item.fromAccount}
          toAccount={item.toAccount}
          date={item.date}
          onPress={() => handlePress(item)}
        />
      </View>
    ),
    [handlePress, theme.colors.surface]
  );

  const renderHiddenItem = useCallback(
    ({ item }: { item: Transfer & { key: string } }) => (
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
    [handleDelete, theme.colors.errorContainer, theme.colors.onErrorContainer]
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
