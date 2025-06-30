import React, { useCallback, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, Button } from "react-native-paper";
import { useCategories } from "@/hooks/db/categories";
import { useFocusEffect, useRouter } from "expo-router";

import CategoryListView from "@/components/expcategory/CategoryListView";

export default function ExpenseCategoriesScreen() {
  const router = useRouter();

  const { data: categories = [], loading, error, refetch } = useCategories();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const toggleExpand = (id: number): void => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEdit = (id: number): void => {
    router.push(`./expcategories/${id}/edit`);
  };

  const getChildren = (parentId: number) =>
    categories.filter((cat) => cat.parentId === parentId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Error loading categories: {error.message}</Text>
        <Button mode="outlined" onPress={refetch} style={{ marginTop: 8 }}>
          Try Again
        </Button>
      </View>
    );
  }

  const topLevelCategories = categories.filter((cat) => cat.parentId === null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CategoryListView
        categories={topLevelCategories}
        level={0}
        expandedIds={expandedIds}
        toggleExpand={toggleExpand}
        onEdit={handleEdit}
        getChildren={getChildren}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
