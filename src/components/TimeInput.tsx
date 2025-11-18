// src/components/TimeInput.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BaseInput from "./BaseInput";

interface TimeInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
  containerStyle?: any;
  editable?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleTimePress = () => {
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      // Format as HH:MM (24h format)
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const formattedValue = `${hours}:${minutes}`;

      props.onChangeText(formattedValue);
    }
  };

  // Format time input (HH:MM)
  const formatTime = (text: string) => {
    const numbers = text.replace(/[^\d:]/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2).replace(":", "")}`;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  };

  const handleChangeText = (text: string) => {
    const formattedText = formatTime(text);
    props.onChangeText(formattedText);
  };

  const getCurrentTime = () => {
    if (props.value) {
      const [hours, minutes] = props.value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date;
    }
    return new Date();
  };

  return (
    <View style={props.containerStyle}>
      <TouchableOpacity onPress={handleTimePress}>
        <View pointerEvents="none">
          <BaseInput
            {...props}
            placeholder={props.placeholder || "Toque para selecionar hora"}
            maxLength={5}
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
          value={getCurrentTime()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickerChange}
          locale="pt-BR"
          is24Hour={true}
        />
      )}
    </View>
  );
};

export default TimeInput;
