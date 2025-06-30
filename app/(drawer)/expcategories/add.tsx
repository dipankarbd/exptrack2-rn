import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";

import ProgressDialog from "@/components/common/ProgressDialog";

import { useAddCategory, useCategories } from "@/hooks/db/categories";
import CategoryForm, {
  CategoryFormData,
} from "@/components/expcategory/CategoryForm";

export default function CreateCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      parentId: null,
    },
  });

  const { data: categories = [], error: categoriesError } = useCategories();
  const { addCategory, isAdding, error: addError } = useAddCategory();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (addError || categoriesError) {
      setShowError(true);
    }
  }, [addError, categoriesError]);

  const onSubmit = async (data: CategoryFormData) => {
    const success = await addCategory(data);
    if (success) {
      router.back();
    }
  };

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
          <CategoryForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            categories={categories}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isAdding} message="Saving category..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {addError?.message ||
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
