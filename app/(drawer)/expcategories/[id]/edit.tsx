import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar, IconButton } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import ProgressDialog from "@/components/common/ProgressDialog";

import {
  useCategories,
  useCategoryById,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/db/categories";

import CategoryForm, {
  CategoryFormData,
} from "@/components/expcategory/CategoryForm";

export default function EditCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const categoryId = Number(id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>();

  const { data: categories = [], error: categoriesError } = useCategories();
  const {
    data: category,
    loading,
    error: categoryError,
  } = useCategoryById(categoryId);

  const {
    updateCategory,
    isUpdating,
    error: updateError,
  } = useUpdateCategory();

  const {
    deleteCategory,
    isDeleting,
    error: deleteError,
  } = useDeleteCategory();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("parentId", category.parentId ?? null);
    }
  }, [category, setValue]);

  useEffect(() => {
    if (updateError || categoryError || categoriesError || deleteError) {
      setShowError(true);
    }
  }, [updateError, categoryError, categoriesError, deleteError]);

  const onSubmit = async (data: CategoryFormData) => {
    const success = await updateCategory({
      id: categoryId,
      name: data.name,
      parentId: data.parentId,
    });

    if (success) {
      router.back();
    }
  };

  const onDelete = useCallback(() => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteCategory(categoryId);
            if (success) {
              router.back();
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [categoryId, deleteCategory, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="delete"
          iconColor={theme.colors.error}
          onPress={onDelete}
          disabled={isDeleting}
          accessibilityLabel="Delete Category"
        />
      ),
    });
  }, [navigation, onDelete, theme.colors.error, isDeleting]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {category && (
            <CategoryForm
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
              categories={categories.filter((c) => c.id !== categoryId)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog
          isVisible={loading || isUpdating || isDeleting}
          message={isDeleting ? "Deleting category..." : "Saving changes..."}
        />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {deleteError?.message ||
          updateError?.message ||
          categoryError?.message ||
          categoriesError?.message ||
          "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
