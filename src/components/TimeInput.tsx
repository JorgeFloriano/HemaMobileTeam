// src/components/TimeInput.tsx
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BaseInput, { BaseInputRef } from "./BaseInput";

interface TimeInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
  containerStyle?: any;
  editable?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export interface TimeInputRef {
  focus: () => void;
  validate: () => boolean;
  clearError: () => void;
}

const TimeInput = forwardRef<TimeInputRef, TimeInputProps>((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<string>(props.value);

  // Create the inputRef for BaseInput
  const inputRef = useRef<BaseInputRef>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    validate: () => {
      return inputRef.current?.validate() ?? false;
    },
    clearError: () => {
      inputRef.current?.clearError();
    },
  }));

  const handleTimePress = () => {
    setTempTime(props.value); // Store current value when opening picker
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    // For Android: handle based on event type
    if (Platform.OS === "android") {
      setShowPicker(false);

      if (event.type === "set" && selectedDate) {
        // User pressed "OK" - set the time
        const hours = selectedDate.getHours().toString().padStart(2, "0");
        const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
        const formattedValue = `${hours}:${minutes}`;
        props.onChangeText(formattedValue);
      } else if (event.type === "dismissed") {
        // User pressed "Cancel" - clear the time
        props.onChangeText("");
      }
    } else {
      // For iOS: we'll handle with custom buttons
      if (selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, "0");
        const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
        const formattedValue = `${hours}:${minutes}`;
        setTempTime(formattedValue);
      }
    }
  };

  // iOS: Handle OK button press
  const handleIOSConfirm = () => {
    setShowPicker(false);
    props.onChangeText(tempTime);
  };

  // iOS: Handle Cancel button press
  const handleIOSCancel = () => {
    setShowPicker(false);
    props.onChangeText(""); // Clear the time
    setTempTime(""); // Reset temp time
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

  // Custom iOS Picker with buttons
  const renderIOSPicker = () => (
    <View style={styles.iosContainer}>
      <View style={styles.iosHeader}>
        <TouchableOpacity onPress={handleIOSCancel} style={styles.iosButton}>
          <Text style={styles.iosCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <View style={styles.iosTitle}>
          <Text style={styles.iosTitleText}>Selecionar Hora</Text>
        </View>
        <TouchableOpacity onPress={handleIOSConfirm} style={styles.iosButton}>
          <Text style={styles.iosConfirmText}>OK</Text>
        </TouchableOpacity>
      </View>
      <DateTimePicker
        value={tempTime ? getTimeFromString(tempTime) : new Date()}
        mode="time"
        display="spinner"
        onChange={handlePickerChange}
        locale="pt-BR"
        is24Hour={true}
        style={styles.iosPicker}
      />
    </View>
  );

  // Helper function to convert time string to Date
  const getTimeFromString = (timeString: string): Date => {
    if (timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
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
            ref={inputRef}
            placeholder={props.placeholder || "Selecionar hora"}
            maxLength={5}
            onChangeText={handleChangeText}
            isFocused={showPicker}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="numbers-and-punctuation"
            style={[props.style, !props.value && { color: "#6b7280" }]}
          />
        </View>
      </TouchableOpacity>

      {showPicker && (
        <>
          {Platform.OS === "ios" ? (
            renderIOSPicker()
          ) : (
            <DateTimePicker
              value={getCurrentTime()}
              mode="time"
              display="default"
              onChange={handlePickerChange}
              locale="pt-BR"
              is24Hour={true}
            />
          )}
        </>
      )}
    </View>
  );
});

// Assign displayName to the component
TimeInput.displayName = "TimeInput";

// Styles with proper StyleSheet.create
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  iosContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 20,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  iosButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iosCancelText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "400",
  },
  iosConfirmText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iosTitle: {
    flex: 1,
    alignItems: "center",
  },
  iosTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  iosPicker: {
    height: 200,
  },
});

export default TimeInput;
