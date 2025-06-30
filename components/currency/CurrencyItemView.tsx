import React from "react";
import { List, useTheme } from "react-native-paper";

import CurrencySymbolView from "./CurrencySymbolView";

type Props = {
  symbol: string;
  description: string;
  code: string;
  onPress?: () => void;
};

export default function CurrencyItemView({
  symbol,
  description,
  code,
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <List.Item
      title={description}
      description={`Code: ${code}`}
      titleStyle={{ color: theme.colors.onSurface }}
      descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
      onPress={onPress}
      left={() => <CurrencySymbolView symbol={symbol} />}
    />
  );
}
