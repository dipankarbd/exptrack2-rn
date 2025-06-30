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
import AccountForm, { AccountFormData } from "@/components/account/AccountForm";

import { useAddAccount } from "@/hooks/db/account";
import { useCurrencies } from "@/hooks/db/currency";

export default function CreateAccountScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    defaultValues: {
      type: "Bank",
      state: "Active",
    },
  });

  const { data: currencies, error: currenciesError } = useCurrencies();
  const { addAccount, isAdding, error: addError } = useAddAccount();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (addError || currenciesError) {
      setShowError(true);
    }
  }, [addError, currenciesError]);

  const onSubmit = async (data: AccountFormData) => {
    const success = await addAccount(data);
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
        <ProgressDialog isVisible={isAdding} message="Please wait..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{
          label: "Dismiss",
          onPress: () => setShowError(false),
        }}
      >
        {addError?.message ||
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
