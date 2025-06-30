import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons, Button, Text } from "react-native-paper";

import DateTimePickerModal from "react-native-modal-datetime-picker";

type FilterOption = "day" | "week" | "month" | "custom";

type Props = {
  onChange: (dates: { startDate?: string; endDate?: string }) => void;
};

export default function DayFilterBar({ onChange }: Props) {
  const [filter, setFilter] = useState<FilterOption>("day");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [pickerType, setPickerType] = useState<"start" | "end" | null>(null);

  const applyFilter = useCallback(
    (type: FilterOption) => {
      setFilter(type);

      if (type === "custom") {
        setStartDate(null);
        setEndDate(null);
        onChange({ startDate: undefined, endDate: undefined });
        return;
      }

      const now = dayjs();
      let start: string | undefined;
      let end: string | undefined;

      if (type === "day") {
        start = now.startOf("day").format("YYYY-MM-DD HH:mm:ss");
        end = now.endOf("day").format("YYYY-MM-DD HH:mm:ss");
      } else if (type === "week") {
        start = now.startOf("week").format("YYYY-MM-DD HH:mm:ss");
        end = now.endOf("week").format("YYYY-MM-DD HH:mm:ss");
      } else if (type === "month") {
        start = now.startOf("month").format("YYYY-MM-DD HH:mm:ss");
        end = now.endOf("month").format("YYYY-MM-DD HH:mm:ss");
      }

      setStartDate(null);
      setEndDate(null);
      onChange({ startDate: start, endDate: end });
    },
    [setFilter, setStartDate, setEndDate, onChange]
  );

  useEffect(() => {
    applyFilter("day");
  }, [applyFilter]);

  const handleConfirm = (date: Date) => {
    if (pickerType === "start") {
      setStartDate(date);
    } else if (pickerType === "end") {
      setEndDate(date);
    }
    setPickerType(null);
  };

  const handleApplyCustom = useCallback(() => {
    const start = startDate
      ? dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
      : undefined;
    const end = endDate
      ? dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
      : undefined;
    onChange({ startDate: start, endDate: end });
  }, [startDate, endDate, onChange]);

  return (
    <View style={styles.container}>
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
        style={{ marginBottom: 8 }}
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
          <Button mode="outlined" onPress={() => setPickerType("end")}>
            <Text>
              {endDate ? dayjs(endDate).format("DD MMM YYYY") : "End Date"}
            </Text>
          </Button>
          <Button
            mode="contained"
            onPress={handleApplyCustom}
            disabled={!startDate}
          >
            Apply
          </Button>
        </View>
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
  labelStyle: {
    fontSize: 14,
    paddingVertical: 0,
  },
  customRange: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
});
