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

import CurrencyForm from "@/components/currency/CurrencyForm"; 
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAddCurrency } from "@/hooks/db/currency";

type FormData = {
  code: string;
  description: string;
  symbol: string;
};

export default function CreateCurrencyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const { addCurrency, error, isAdding } = useAddCurrency();

  const onSubmit = async (data: FormData) => {
    const success = await addCurrency(data);

    if (success) {
      router.back();
    }
  };

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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
          <CurrencyForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isAdding} message="Creating currency..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        action={{
          label: "Dismiss",
          onPress: () => setShowError(false),
        }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error?.message || "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
