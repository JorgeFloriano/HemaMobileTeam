// src/components/BaseInput.tsx
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  TextInput,
  TextStyle,
  ViewStyle,
  Text,
  View,
  StyleSheet,
  StyleProp,
} from "react-native";

interface BaseInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  keyboardType?: any;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
  secureTextEntry?: boolean;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean; // New required prop
  error?: boolean; // Error state for validation
  errorMessage?: string; // Custom error message
}

export interface BaseInputRef {
  focus: () => void;
  validate: () => boolean;
  clearError: () => void;
}

const BaseInput = forwardRef<BaseInputRef, BaseInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      maxLength,
      multiline = false,
      numberOfLines = 1,
      style,
      containerStyle,
      autoCapitalize = "sentences",
      autoCorrect = true,
      editable = true,
      keyboardType = "default",
      returnKeyType,
      onSubmitEditing,
      secureTextEntry = false,
      isFocused = false,
      onFocus,
      onBlur,
      required = false, // Default to false
      error = false, // Default to false
      errorMessage = "Campo obrigatório", // Default error message
    },
    ref
  ) => {
    const [localError, setLocalError] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      validate: () => {
        const isValid = !required || !!value.trim();
        setLocalError(!isValid);
        return isValid;
      },
      clearError: () => {
        setLocalError(false);
      },
    }));

    const handleChangeText = (text: string) => {
      onChangeText(text);
      // Clear error when user starts typing
      if (localError && text.trim()) {
        setLocalError(false);
      }
    };

    const handleFocus = () => {
      onFocus?.();
      // Clear error when user focuses on the field
      setLocalError(false);
    };

    const handleBlur = () => {
      onBlur?.();
      // Validate on blur if required
      if (required && !value.trim()) {
        setLocalError(true);
      }
    };

    const baseStyle: TextStyle = {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ced4da",
      borderRadius: 8,
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 16,
      color: "#333",
      ...(isFocused && {
        borderColor: localError || error ? "#dc3545" : "#270984",
        outlineColor: "#2809843e",
        outlineWidth: 3,
        outlineStyle: "solid",
        paddingLeft: 12,
      }),
      ...(multiline && {
        minHeight: 150,
        textAlignVertical: "top",
      }),
    };

    const isError = localError || error;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            {required && <View style={styles.requiredDot} />}
            <Text style={styles.label}>
              {label}
              {required}
            </Text>
          </View>
        )}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          placeholder={isError ? errorMessage : placeholder}
          placeholderTextColor={isError ? "#dc3545" : "#969a9fff"}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[baseStyle, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requiredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dc3545",
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});

// Add display name to fix ESLint error
BaseInput.displayName = "BaseInput";

export default BaseInput;
