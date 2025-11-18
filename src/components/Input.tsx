import { EyeOffIcon, EyeIcon } from "@/assets/images/icons/eye";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  TextInput,
  Platform,
  TextStyle,
  ViewStyle,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  type?: "text" | "email" | "password" | "date" | "time" | "number";
  // Add these new props for login functionality
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean; // New prop to enable show/hide toggle
  editable?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad";
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
}

const Input: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  containerStyle,
  type = "text",
  // New props with defaults
  autoCapitalize = "sentences",
  autoCorrect = true,
  editable = true,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  secureTextEntry = false,
  showPasswordToggle = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const handleDatePress = () => {
    if (type === "date" || type === "time") {
      setPickerMode(type);
      setShowPicker(true);
    }
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      let formattedValue = "";

      if (type === "date") {
        // Format as DD/MM/YYYY (Brazilian format)
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
        const year = selectedDate.getFullYear();
        formattedValue = `${day}/${month}/${year}`;
      } else if (type === "time") {
        // Format as HH:MM (same as before, but 24h format is standard in Brazil)
        const hours = selectedDate.getHours().toString().padStart(2, "0");
        const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
        formattedValue = `${hours}:${minutes}`;
      }

      onChangeText(formattedValue);
    }
  };

  // Get current date for the picker
  const getCurrentDate = () => {
    if (value) {
      if (type === "date") {
        return new Date(value);
      } else if (type === "time") {
        const [hours, minutes] = value.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return date;
      }
    }
    return new Date();
  };

  // Get keyboard type based on input type
  const getKeyboardType = () => {
    if (keyboardType) return keyboardType;

    switch (type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      case "date":
      case "time":
        return "numbers-and-punctuation";
      default:
        return "default";
    }
  };

  // Get secure text entry based on type
  const getSecureTextEntry = () => {
    if (secureTextEntry && !isPasswordVisible) {
      return true;
    }
    return false;
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
    let formattedText = text;

    if (type === "date") {
      formattedText = formatDate(text);
    } else if (type === "time") {
      formattedText = formatTime(text);
    }

    onChangeText(formattedText);
  };

  // Get placeholder based on type
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    switch (type) {
      case "date":
        return "Toque para selecionar data";
      case "time":
        return "Toque para selecionar hora";
      default:
        return "";
    }
  };

  // Get max length based on type
  const getMaxLength = () => {
    if (maxLength) return maxLength;

    switch (type) {
      case "date":
        return 10;
      case "time":
        return 5;
      default:
        return undefined;
    }
  };

  const inputStyle: TextStyle = {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    //padding: 12,
    fontSize: 16,
    // Put focus styles first
    ...(isFocused && {
      borderColor: "#270984",
      outlineColor: "#2809843e",
      //outlineStyle: "solid",
      outlineWidth: 3,
      //padding: 12,
    }),
    // Then other conditional styles
    ...(multiline && {
      minHeight: 150,
      textAlignVertical: "top",
    }),
    ...((type === "date" || type === "time") && {
      color: value ? "#333" : "#6b7280",
    }),
    ...(showPasswordToggle &&
      secureTextEntry &&
      {
        //paddingRight: 50, // Ensure consistent padding
      }),
    // Custom style last (so it can override everything)
    ...style,
  };

  // For date/time inputs, we'll use a TouchableOpacity to trigger the picker
  if (type === "date" || type === "time") {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity onPress={handleDatePress}>
          <View pointerEvents="none">
            <TextInput
              value={value}
              onChangeText={handleChangeText}
              placeholder={getPlaceholder()}
              placeholderTextColor="#969a9fff"
              maxLength={getMaxLength()}
              multiline={multiline}
              numberOfLines={numberOfLines}
              style={inputStyle}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              secureTextEntry={getSecureTextEntry()}
              onSubmitEditing={onSubmitEditing}
              keyboardType={
                type === "date" || type === "time"
                  ? "numbers-and-punctuation"
                  : "default"
              }
              editable={true} // Still editable for manual input
            />
          </View>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={getCurrentDate()}
            mode={pickerMode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handlePickerChange}
            locale="pt-BR" // Portuguese locale
            {...(type === "date" && {
              minimumDate: new Date(2000, 0, 1),
              maximumDate: new Date(2100, 11, 31),
            })}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={getPlaceholder()}
          placeholderTextColor="#969a9fff"
          maxLength={getMaxLength()}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithToggle,
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={getKeyboardType()}
          secureTextEntry={getSecureTextEntry()}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />

        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <View>
              {isPasswordVisible ? (
                <EyeOffIcon width={20} height={20} color="#666" />
              ) : (
                <EyeIcon width={20} height={20} color="#666" />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  toggleButton: {
    position: "absolute",
    visibility: "visible",
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    paddingRight: 16,
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: 50, // Space for the toggle button
    backgroundColor: "transparent",
  },
  inputWrapper: {
    position: "relative",
  },
});

export default Input;
