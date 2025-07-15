import * as SecureStore from "expo-secure-store";

const PASSWORD_KEY = "app_password";

export const setPassword = async (password: string) => {
  await SecureStore.setItemAsync(PASSWORD_KEY, password);
};

export const getPassword = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(PASSWORD_KEY);
};

export const clearPassword = async () => {
  await SecureStore.deleteItemAsync(PASSWORD_KEY);
};
