import React, { useMemo, useState, useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Divider,
  IconButton,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";

import AccountItemView from "./AccountItemView";

type Account = {
  id: number;
  type: "Bank" | "Cash" | "CreditCard";
  state: "Active" | "Inactive" | "Closed";
  name: string;
  currency: {
    code: string;
  };
  balance: number;
};

type Props = {
  accounts: Account[];
  onPress?: (accountId: number) => void;
  onDeleteAccount?: (id: number) => void;
};

function useFilteredAccounts(accounts: Account[], showOnlyActive: boolean) {
  return useMemo(() => {
    return showOnlyActive
      ? accounts.filter((acc) => acc.state === "Active")
      : accounts;
  }, [accounts, showOnlyActive]);
}

export default function AccountListView({
  accounts,
  onPress,
  onDeleteAccount,
}: Props) {
  const theme = useTheme();
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const filteredAccounts = useFilteredAccounts(accounts, showOnlyActive);

  const listData = useMemo(
    () =>
      filteredAccounts.map((account) => ({
        key: account.id.toString(),
        ...account,
      })),
    [filteredAccounts]
  );

  const handlePress = useCallback(
    (account: Account) => {
      onPress?.(account.id);
    },
    [onPress]
  );

  const handleDelete = useCallback(
    (account: Account) => {
      Alert.alert(
        "Delete Account",
        `Are you sure you want to delete the account "${account.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDeleteAccount?.(account.id),
          },
        ]
      );
    },
    [onDeleteAccount]
  );

  const renderItem = useCallback(
    ({ item }: { item: Account & { key: string } }) => (
      <View
        style={[
          styles.frontRowContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <AccountItemView
          name={item.name}
          type={item.type}
          state={item.state}
          currency={item.currency.code}
          balance={item.balance}
          onPress={() => handlePress(item)}
        />
      </View>
    ),
    [theme.colors.surface, handlePress]
  );

  const renderHiddenItem = useCallback(
    ({ item }: { item: Account & { key: string } }) => (
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
    <View style={styles.wrapper}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={showOnlyActive ? "active" : "all"}
          onValueChange={(value) => setShowOnlyActive(value === "active")}
          buttons={[
            { value: "active", label: "Active" },
            { value: "all", label: "All" },
          ]}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    paddingBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
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
