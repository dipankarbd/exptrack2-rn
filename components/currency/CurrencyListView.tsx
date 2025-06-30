import React, { useCallback, useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Divider, IconButton, useTheme } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";

import CurrencyItemView from "./CurrencyItemView";

type Currency = {
  id: number;
  symbol: string;
  description: string;
  code: string;
};

type Props = {
  currencies: Currency[];
  onPress?: (currencyId: number) => void;
  onDeleteCurrency?: (currencyId: number) => void;
};

export default function CurrencyListView({
  currencies,
  onPress,
  onDeleteCurrency,
}: Props) {
  const theme = useTheme();

  const listData = useMemo(
    () =>
      currencies.map((currency) => ({
        key: currency.id.toString(),
        ...currency,
      })),
    [currencies]
  );

  const handlePress = useCallback(
    (currency: Currency) => {
      onPress?.(currency.id);
    },
    [onPress]
  );

  const handleDelete = useCallback(
    (currency: Currency) => {
      Alert.alert(
        "Delete Currency",
        `Are you sure you want to delete currency "${currency.code}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDeleteCurrency?.(currency.id),
          },
        ]
      );
    },
    [onDeleteCurrency]
  );

  const renderItem = useCallback(
    ({ item }: { item: Currency & { key: string } }) => (
      <View
        style={[
          styles.frontRowContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <CurrencyItemView
          symbol={item.symbol}
          description={item.description}
          code={item.code}
          onPress={() => handlePress(item)}
        />
      </View>
    ),
    [theme.colors.surface, handlePress]
  );

  const renderHiddenItem = useCallback(
    ({ item }: { item: Currency & { key: string } }) => (
      <View style={styles.hiddenItemContainer}>
        <View style={styles.hiddenItemLeft} />
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
      ItemSeparatorComponent={() => <Divider />}
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
