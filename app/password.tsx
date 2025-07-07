import React, { useState } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
} from "react-native";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTheme, Snackbar, Portal } from "react-native-paper";

import PasswordForm from "@/components/password/PasswordForm";
import ProgressDialog from "@/components/common/ProgressDialog";
import { getPassword } from "@/lib/password";

type FormData = {
  password: string;
};

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const [showError, setShowError] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const saved = await getPassword();
      if (saved && data.password !== saved) {
        throw new Error("Invalid password");
      } else {
        router.replace("/(drawer)/(tabs)/expense");
      }
    } catch {
      setShowError(true);
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
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            ExpTrack
          </Text>

          <PasswordForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isSubmitting} message="Openning..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        Invalid password
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
});
