import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";

import CurrencyForm from "@/components/currency/CurrencyForm";
import {
  useCurrencyById,
  useDeleteCurrency,
  useUpdateCurrency,
} from "@/hooks/db/currency";
import ProgressDialog from "@/components/common/ProgressDialog";

type FormData = {
  code: string;
  description: string;
  symbol: string;
};

export default function EditCurrencyScreen() {
  const theme = useTheme();

  const { id } = useLocalSearchParams();
  const currencyId = Number(id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const currency = useCurrencyById(currencyId);
  const {
    updateCurrency,
    error: updateError,
    isUpdating,
  } = useUpdateCurrency();
  const { error: deleteError, isDeleting } = useDeleteCurrency();

  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (currency) {
      setValue("code", currency.code);
      setValue("description", currency.description);
      setValue("symbol", currency.symbol);
    }
  }, [currency, setValue]);

  useEffect(() => {
    if (updateError || deleteError) {
      setShowError(true);
    }
  }, [updateError, deleteError]);

  const onSubmit = async (data: FormData) => {
    const success = await updateCurrency({ id: currencyId, ...data });
    if (success) {
      setSuccessMessage("Currency updated successfully!");
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
          <CurrencyForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog
          isVisible={isUpdating || isDeleting}
          message="Please wait..."
        />
      </Portal>

      {successMessage && (
        <Snackbar
          visible={!!successMessage}
          onDismiss={() => setSuccessMessage("")}
          duration={3000}
          action={{
            label: "Dismiss",
            onPress: () => setSuccessMessage(""),
          }}
          style={{ backgroundColor: theme.colors.primary }}
        >
          {successMessage}
        </Snackbar>
      )}

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
        {(updateError || deleteError)?.message || "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
