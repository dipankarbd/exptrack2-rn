import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, SegmentedButtons, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

type FilterOption = "day" | "week" | "month" | "custom";

type Account = {
  id: number;
  name: string;
};

type Props = {
  accounts: Account[];
  onChange: (params: {
    startDate?: string;
    endDate?: string;
    accountId?: number;
  }) => void;
};

export default function TransactionFilterBar({ accounts, onChange }: Props) {
  const [filter, setFilter] = useState<FilterOption>("day");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickerType, setPickerType] = useState<"start" | "end" | null>(null);
  const [didInit, setDidInit] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<{ accountId: number }>({
    defaultValues: { accountId: undefined },
  });

  const selectedAccountId = watch("accountId");

  const accountOptions = accounts.map((acc) => ({
    label: acc.name,
    value: acc.id.toString(),
  }));

  const getFilterRange = useCallback((type: FilterOption) => {
    const now = dayjs();
    switch (type) {
      case "day":
        return {
          startDate: now.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
          endDate: now.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        };
      case "week":
        return {
          startDate: now.startOf("week").format("YYYY-MM-DD HH:mm:ss"),
          endDate: now.endOf("week").format("YYYY-MM-DD HH:mm:ss"),
        };
      case "month":
        return {
          startDate: now.startOf("month").format("YYYY-MM-DD HH:mm:ss"),
          endDate: now.endOf("month").format("YYYY-MM-DD HH:mm:ss"),
        };
      default:
        return {};
    }
  }, []);

  const applyFilter = useCallback((type: FilterOption) => {
    setFilter(type);
    setRangeError(false);
    if (type !== "custom") {
      setStartDate(null);
      setEndDate(null);
    }
  }, []);

  useEffect(() => {
    if (!didInit) {
      setDidInit(true);
      return;
    }

    if (selectedAccountId === undefined) return;

    if (filter === "custom") {
      if (startDate && endDate && startDate > endDate) {
        setRangeError(true);
        return;
      }

      setRangeError(false);

      const start = startDate
        ? dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
        : undefined;
      const end = endDate
        ? dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
        : undefined;

      onChange({
        startDate: start,
        endDate: end,
        accountId: selectedAccountId,
      });
    } else {
      setRangeError(false);
      const range = getFilterRange(filter);
      onChange({
        ...range,
        accountId: selectedAccountId,
      });
    }
  }, [
    selectedAccountId,
    didInit,
    filter,
    startDate,
    endDate,
    getFilterRange,
    onChange,
  ]);

  const handleConfirm = (date: Date) => {
    if (pickerType === "start") {
      setStartDate(date);
    } else if (pickerType === "end") {
      setEndDate(date);
    }
    setPickerType(null);
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="accountId"
        rules={{ required: true }}
        render={({ field: { onChange: onAccountChange, value } }) => (
          <Dropdown
            label="Account"
            value={value?.toString()}
            onSelect={(val) => onAccountChange(Number(val))}
            options={accountOptions}
            error={!!errors.accountId}
          />
        )}
      />
      {errors.accountId && (
        <HelperText type="error">Please select an account.</HelperText>
      )}

      <SegmentedButtons
        value={filter}
        onValueChange={(value) => applyFilter(value as FilterOption)}
        buttons={[
          { value: "day", label: "Today", style: styles.segmentButton },
          { value: "week", label: "Week", style: styles.segmentButton },
          { value: "month", label: "Month", style: styles.segmentButton },
          { value: "custom", label: "Range", style: styles.segmentButton },
        ]}
        density="small"
        style={{ marginVertical: 8 }}
      />

      {filter === "custom" && (
        <View style={styles.customRange}>
          <Button mode="outlined" onPress={() => setPickerType("start")}>
            <Text>
              {startDate
                ? dayjs(startDate).format("DD MMM YYYY")
                : "Start Date"}
            </Text>
          </Button>
          <Text style={styles.dash}>–</Text>
          <Button mode="outlined" onPress={() => setPickerType("end")}>
            <Text>
              {endDate ? dayjs(endDate).format("DD MMM YYYY") : "End Date"}
            </Text>
          </Button>
        </View>
      )}

      {rangeError && (
        <HelperText type="error">
          Start date must be before or same as end date.
        </HelperText>
      )}

      <DateTimePickerModal
        isVisible={pickerType !== null}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setPickerType(null)}
        maximumDate={new Date()}
        date={
          pickerType === "end" && endDate ? endDate : startDate || new Date()
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  segmentButton: {
    height: 40,
    justifyContent: "center",
  },
  customRange: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  dash: {
    marginHorizontal: 4,
    fontSize: 16,
  },
});
