// src/components/DateInput.tsx
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
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BaseInput, { BaseInputRef } from "./BaseInput";

interface DateInputProps {
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

export interface DateInputRef {
  focus: () => void;
  validate: () => boolean;
  clearError: () => void;
}

const DateInput = forwardRef<DateInputRef, DateInputProps>((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<string>(props.value);

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

  const handleDatePress = () => {
    setTempDate(props.value); // Store current value when opening picker
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    // For Android: handle based on event type
    if (Platform.OS === "android") {
      setShowPicker(false);

      if (event.type === "set" && selectedDate) {
        // User pressed "OK" - set the date
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const year = selectedDate.getFullYear();
        const formattedValue = `${day}/${month}/${year}`;
        props.onChangeText(formattedValue);
      } else if (event.type === "dismissed") {
        // User pressed "Cancel" - clear the date
        props.onChangeText("");
      }
    } else {
      // For iOS: we'll handle with custom buttons
      if (selectedDate) {
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const year = selectedDate.getFullYear();
        const formattedValue = `${day}/${month}/${year}`;
        setTempDate(formattedValue);
      }
    }
  };

  // iOS: Handle OK button press
  const handleIOSConfirm = () => {
    setShowPicker(false);
    props.onChangeText(tempDate);
  };

  // iOS: Handle Cancel button press
  const handleIOSCancel = () => {
    setShowPicker(false);
    props.onChangeText(""); // Clear the date
    setTempDate(""); // Reset temp date
  };

  // Format date input (DD/MM/YYYY)
  const formatDate = (text: string) => {
    const numbers = text.replace(/[^\d]/g, ""); // Remove all non-digits

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
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

  // Get the date for the picker - FIXED VERSION
  const getPickerDate = (): Date => {
    // If we have a valid DD/MM/YYYY value, parse it
    if (props.value && props.value.length === 10) {
      const [day, month, year] = props.value.split("/").map(Number);
      const date = new Date(year, month - 1, day);

      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Otherwise return current date
    return new Date();
  };

  // Helper function to convert date string to Date
  const getDateFromString = (dateString: string): Date => {
    if (dateString && dateString.length === 10) {
      const [day, month, year] = dateString.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  };

  // Custom iOS Picker with buttons
  const renderIOSPicker = () => (
    <Modal
      visible={showPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={handleIOSCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.iosContainer}>
          <View style={styles.iosHeader}>
            <TouchableOpacity
              onPress={handleIOSCancel}
              style={styles.iosButton}
            >
              <Text style={styles.iosCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <View style={styles.iosTitle}>
              <Text style={styles.iosTitleText}>Selecionar Data</Text>
            </View>
            <TouchableOpacity
              onPress={handleIOSConfirm}
              style={styles.iosButton}
            >
              <Text style={styles.iosConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate ? getDateFromString(tempDate) : new Date()}
            mode="date"
            display="spinner"
            onChange={handlePickerChange}
            locale="pt-BR"
            minimumDate={new Date(2000, 0, 1)}
            maximumDate={new Date(2100, 11, 31)}
            style={styles.iosPicker}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={props.containerStyle}>
      <TouchableOpacity onPress={handleDatePress} activeOpacity={0.7}>
        <View pointerEvents="none">
          <BaseInput
            {...props}
            ref={inputRef}
            placeholder={props.placeholder || "Selecionar data"}
            maxLength={10}
            onChangeText={handleChangeText}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="numeric"
            style={[props.style, !props.value && { color: "#6b7280" }]}
          />
        </View>
      </TouchableOpacity>

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={getPickerDate()}
          mode="date"
          display="default"
          onChange={handlePickerChange}
          locale="pt-BR"
          minimumDate={new Date(2000, 0, 1)}
          maximumDate={new Date(2100, 11, 31)}
        />
      )}

      {Platform.OS === "ios" && renderIOSPicker()}
    </View>
  );
});

// Assign displayName to the component
DateInput.displayName = "DateInput";

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

export default DateInput;
