import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Text,
  List,
  IconButton,
  useTheme,
} from "react-native-paper";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

interface SectionItem {
  id: number;
  name: string;
}

interface Section {
  title: string;
  data: SectionItem[];
}

interface Props {
  value: number | null;
  onChange: (val: number) => void;
  error?: boolean;
  categories: Category[];
}

const buildCategorySections = (categories: Category[]): Section[] => {
  const parentCategories = categories.filter((cat) => cat.parentId === null);
  const childCategories = categories.filter((cat) => cat.parentId !== null);

  return parentCategories.map((parent) => ({
    title: parent.name,
    data: childCategories
      .filter((child) => child.parentId === parent.id)
      .map((child) => ({ id: child.id, name: child.name })),
  }));
};

const findCategoryById = (
  categories: Category[],
  id: number
): Category | undefined => categories.find((category) => category.id === id);

const getParentCategoryName = (
  categories: Category[],
  selectedCategory: Category
): string => {
  if (selectedCategory.parentId === null) {
    return selectedCategory.name;
  }

  const parent = findCategoryById(categories, selectedCategory.parentId);
  return parent?.name || "";
};

const useSelectedLabel = (value: number | null, categories: Category[]) => {
  return useMemo(() => {
    if (value === null) return "";
    const selectedCategory = findCategoryById(categories, value);
    return selectedCategory?.name || "";
  }, [value, categories]);
};

const useFilteredSections = (sections: Section[], searchQuery: string) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return sections;

    return sections
      .map((section) => ({
        ...section,
        data: section.data.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.data.length > 0);
  }, [sections, searchQuery]);
};

const useExpandedSections = (
  value: number | null,
  categories: Category[],
  searchQuery: string,
  filteredSections: Section[]
) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (value === null) {
      setExpandedSections(new Set());
      return;
    }

    const selectedCategory = findCategoryById(categories, value);
    if (!selectedCategory) return;

    const parentTitle = getParentCategoryName(categories, selectedCategory);
    if (parentTitle) {
      setExpandedSections(new Set([parentTitle]));
    }
  }, [value, categories]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const expandedTitles = new Set(
        filteredSections.map((section) => section.title)
      );
      setExpandedSections(expandedTitles);
    } else {
      if (value !== null) {
        const selectedCategory = findCategoryById(categories, value);
        if (selectedCategory) {
          const parentTitle = getParentCategoryName(
            categories,
            selectedCategory
          );
          setExpandedSections(parentTitle ? new Set([parentTitle]) : new Set());
        }
      } else {
        setExpandedSections(new Set());
      }
    }
  }, [searchQuery, filteredSections, value, categories]);

  const toggleSection = useCallback((title: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  }, []);

  return { expandedSections, toggleSection };
};

export default function CategoryModalPicker({
  value,
  onChange,
  error = false,
  categories,
}: Props) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLabel = useSelectedLabel(value, categories);
  const sections = useMemo(
    () => buildCategorySections(categories),
    [categories]
  );
  const filteredSections = useFilteredSections(sections, searchQuery);
  const { expandedSections, toggleSection } = useExpandedSections(
    value,
    categories,
    searchQuery,
    filteredSections
  );

  const handleOpenModal = useCallback(() => setModalVisible(true), []);
  const handleCloseModal = useCallback(() => setModalVisible(false), []);
  const handleClearSearch = useCallback(() => setSearchQuery(""), []);
  const handleSelectCategory = useCallback(
    (categoryId: number) => {
      onChange(categoryId);
      setModalVisible(false);
    },
    [onChange]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: Section }) => (
      <TouchableOpacity onPress={() => toggleSection(title)}>
        <View style={styles.sectionHeaderContainer}>
          <List.Icon
            icon={
              expandedSections.has(title) ? "chevron-down" : "chevron-right"
            }
            style={styles.sectionHeaderIcon}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.sectionHeaderText,
              { color: theme.colors.onSurface },
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [expandedSections, toggleSection, theme.colors]
  );

  const renderItem = useCallback(
    ({ item, section }: { item: SectionItem; section: Section }) => {
      if (!expandedSections.has(section.title)) return null;
      const isSelected = value === item.id;

      return (
        <Pressable
          style={styles.item}
          onPress={() => handleSelectCategory(item.id)}
        >
          <View style={styles.itemContent}>
            <Text
              style={[
                styles.itemText,
                { color: theme.colors.onSurfaceVariant },
                isSelected && {
                  color: theme.colors.primary,
                  fontWeight: "500",
                },
              ]}
            >
              {item.name}
            </Text>
            {isSelected && (
              <List.Icon icon="check" color={theme.colors.primary} />
            )}
          </View>
        </Pressable>
      );
    },
    [expandedSections, value, handleSelectCategory, theme.colors]
  );

  return (
    <>
      <Pressable onPress={handleOpenModal}>
        <View pointerEvents="none">
          <TextInput
            label="Category"
            value={selectedLabel}
            editable={false}
            error={error}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: theme.colors.onBackground }]}
            >
              Select Category
            </Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={theme.colors.primary}
              onPress={handleCloseModal}
              accessibilityLabel="Close category picker"
            />
          </View>

          <TextInput
            placeholder="Search categories..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            right={
              searchQuery ? (
                <TextInput.Icon
                  icon="close-circle"
                  onPress={handleClearSearch}
                  accessibilityLabel="Clear search"
                />
              ) : null
            }
          />

          <SectionList
            sections={filteredSections}
            keyExtractor={(item) => `category-${item.id}`}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderItem}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  searchInput: {
    marginBottom: 16,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  sectionHeaderIcon: {
    margin: 0,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 12,
  },
  itemText: {
    fontSize: 15,
  },
});
