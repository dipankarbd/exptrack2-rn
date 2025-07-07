import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar } from "react-native-paper";

import ProgressDialog from "@/components/common/ProgressDialog";
import { clearPassword, getPassword, setPassword } from "@/lib/password";
import PasswordSettingsForm, {
  PasswordSettingsFormData,
} from "@/components/password/PasswordSettingsForm";

export default function SettingsScreen() {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PasswordSettingsFormData>({
    defaultValues: {
      enablePassword: false,
      password: "",
    },
  });

  useEffect(() => {
    (async () => {
      const storedPassword = await getPassword();
      if (storedPassword) {
        setValue("enablePassword", true);
        setValue("password", storedPassword);
      } else {
        setValue("enablePassword", false);
        setValue("password", "");
      }
      setIsLoading(false);
    })();
  }, [setValue]);

  const onSubmit = async (data: PasswordSettingsFormData) => {
    if (data.enablePassword && data.password) {
      await setPassword(data.password);
    } else {
      await clearPassword();
    }

    setShowSnackbar(true);
  };

  if (isLoading) {
    return <ProgressDialog isVisible={true} message="Loading settings..." />;
  }

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <PasswordSettingsForm
          control={control}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </View>

      <Portal>
        <ProgressDialog isVisible={isSubmitting} message="Saving settings..." />
      </Portal>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{ label: "OK", onPress: () => setShowSnackbar(false) }}
      >
        Settings saved successfully!
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
