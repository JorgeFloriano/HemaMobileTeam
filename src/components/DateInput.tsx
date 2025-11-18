// src/components/DateInput.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BaseInput from "./BaseInput";

interface DateInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
  containerStyle?: any;
  editable?: boolean;
}

const DateInput: React.FC<DateInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleDatePress = () => {
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      // Format as DD/MM/YYYY (Brazilian format)
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      const formattedValue = `${day}/${month}/${year}`;

      props.onChangeText(formattedValue);
    }
  };

  // Format date input (DD/MM/YYYY)
  const formatDate = (text: string) => {
    const numbers = text.replace(/[^\d/]/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2).replace("/", "")}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  const handleChangeText = (text: string) => {
    const formattedText = formatDate(text);
    props.onChangeText(formattedText);
  };

  const getCurrentDate = () => {
    if (props.value) {
      return new Date(props.value);
    }
    return new Date();
  };

  return (
    <View style={props.containerStyle}>
      <TouchableOpacity onPress={handleDatePress}>
        <View pointerEvents="none">
          <BaseInput
            {...props}
            placeholder={props.placeholder || "Toque para selecionar data"}
            maxLength={10}
            onChangeText={handleChangeText}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="numbers-and-punctuation"
            style={[props.style, !props.value && { color: "#6b7280" }]} // ← Now this works!
          />
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={getCurrentDate()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickerChange}
          locale="pt-BR"
          minimumDate={new Date(2000, 0, 1)}
          maximumDate={new Date(2100, 11, 31)}
        />
      )}
    </View>
  );
};

export default DateInput;
