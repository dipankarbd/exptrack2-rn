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

import AccountForm, { AccountFormData } from "@/components/account/AccountForm"; 
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccountById, useUpdateAccount } from "@/hooks/db/account";
import { useCurrencies } from "@/hooks/db/currency";

export default function EditAccountScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const accountId = Number(id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>();

  const account = useAccountById(accountId);
  const { updateAccount, isUpdating, error: updateError } = useUpdateAccount();
  const { data: currencies, error: currenciesError } = useCurrencies();

  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (account) {
      setValue("name", account.name);
      setValue("type", account.type);
      setValue("currencyId", account.currencyId);

      setValue("state", account.state);
    }
  }, [account, setValue]);

  useEffect(() => {
    if (updateError || currenciesError) {
      setShowError(true);
    }
  }, [updateError, currenciesError]);

  const onSubmit = async (data: AccountFormData) => {
    const success = await updateAccount({ id: accountId, ...data });
    if (success) {
      setSuccessMessage("Account updated successfully!");
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
          <AccountForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            currencies={currencies}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isUpdating} message="Please wait..." />
      </Portal>

      {!!successMessage && (
        <Snackbar
          visible
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
        {updateError?.message ||
          currenciesError?.message ||
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
