import { Alert } from "react-native";

export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message);
};

export const getFormattedDateTime = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};
