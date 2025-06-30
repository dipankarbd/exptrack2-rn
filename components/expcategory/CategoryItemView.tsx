import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Props = {
  category: Category;
  level: number;
  expandedIds: number[];
  toggleExpand: (id: number) => void;
  onEdit: (id: number) => void;
  getChildren: (parentId: number) => Category[];
  CategoryList: React.FC<any>;
};

export default function CategoryItemView({
  category,
  level,
  expandedIds,
  toggleExpand,
  onEdit,
  getChildren,
  CategoryList,
}: Props) {
  const children = getChildren(category.id);
  const isExpanded = expandedIds.includes(category.id);
  const isParent = children.length > 0;

  return (
    <View key={category.id}>
      <View style={[styles.row, { paddingLeft: level * 16 }]}>
        <TouchableOpacity
          onPress={() => isParent && toggleExpand(category.id)}
          style={styles.labelContainer}
          activeOpacity={isParent ? 0.7 : 1}
        >
          {isParent && (
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={20}
              color="#888"
              style={styles.chevron}
            />
          )}
          <Text style={styles.categoryText}>{category.name}</Text>
        </TouchableOpacity>

        <IconButton
          icon="pencil-outline"
          size={20}
          onPress={() => onEdit(category.id)}
          style={styles.editButton}
        />
      </View>

      {isExpanded && (
        <CategoryList
          categories={children}
          level={level + 1}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onEdit={onEdit}
          getChildren={getChildren}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chevron: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 16,
    color: "#222",
  },
  editButton: {
    margin: 0,
  },
});
