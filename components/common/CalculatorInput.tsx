import React, { useState } from "react";
import { Modal, View, StyleSheet, Text, Pressable } from "react-native";
import { TextInput, IconButton, useTheme } from "react-native-paper";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  placeholder?: string;
};

export default function CalculatorInput({
  label,
  value,
  onChange,
  error,
  placeholder,
}: Props) {
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [expression, setExpression] = useState(value || "");

  const openCalculator = () => {
    setExpression(value || "");
    setModalVisible(true);
  };

  const append = (char: string) => {
    setExpression((prev) => prev + char);
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    setExpression("");
  };

  const sanitizeExpression = (expr: string): string => {
    return expr.replace(/\b0+(\d)/g, "$1");
  };

  const evaluateExpression = (): string | null => {
    try {
      const sanitized = sanitizeExpression(expression);
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === "number" && !isNaN(result)) {
        return result.toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  const confirm = () => {
    const result = evaluateExpression();
    if (result !== null) {
      onChange(result);
    }
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={openCalculator}
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        <TextInput
          label={label}
          value={value}
          editable={false}
          error={error}
          placeholder={placeholder}
          right={
            <TextInput.Icon
              icon="calculator-variant"
              onPress={openCalculator}
            />
          }
        />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[styles.expressionText, { color: theme.colors.onSurface }]}
            >
              {expression || "0"}
            </Text>

            <View style={styles.keypad}>
              {[
                ["7", "8", "9", "/"],
                ["4", "5", "6", "*"],
                ["1", "2", "3", "-"],
                ["0", ".", "=", "+"],
              ].map((row, i) => (
                <View style={styles.row} key={i}>
                  {row.map((key) => (
                    <Pressable
                      key={key}
                      style={({ pressed }) => [
                        styles.key,
                        {
                          backgroundColor: pressed
                            ? theme.colors.backdrop
                            : theme.colors.background,
                        },
                      ]}
                      onPress={() => {
                        if (key === "=") {
                          const result = evaluateExpression();
                          setExpression(result ?? "Error");
                        } else {
                          append(key);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.keyText,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {key}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.footer}>
              <IconButton icon="backspace" onPress={backspace} />
              <IconButton icon="alpha-c" onPress={clear} />
              <IconButton icon="close" onPress={() => setModalVisible(false)} />
              <IconButton
                icon="check"
                onPress={confirm}
                iconColor={theme.colors.primary}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  expressionText: {
    fontSize: 24,
    textAlign: "right",
    marginBottom: 8,
  },
  keypad: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  key: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  keyText: {
    fontSize: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
});
