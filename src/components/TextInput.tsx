// src/components/TextInput.tsx
import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import BaseInput, { BaseInputRef } from "./BaseInput";
import { TextStyle, ViewStyle, StyleProp } from "react-native";

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  type?: "text" | "email" | "number";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  keyboardType?: any;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
  required?: boolean; // Add required prop
  error?: boolean; // Add error prop
  errorMessage?: string; // Add errorMessage prop
}

export interface TextInputRef {
  focus: () => void;
  validate: () => boolean;
  clearError: () => void;
}

const TextInput = forwardRef<TextInputRef, TextInputProps>(({
  type = "text",
  keyboardType,
  autoCapitalize,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const baseInputRef = useRef<BaseInputRef>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      baseInputRef.current?.focus();
    },
    validate: () => {
      return baseInputRef.current?.validate() ?? false;
    },
    clearError: () => {
      baseInputRef.current?.clearError();
    },
  }));

  // Set keyboard type based on input type
  const getKeyboardType = () => {
    if (keyboardType) return keyboardType;

    switch (type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  };

  // Set autoCapitalize based on type
  const getAutoCapitalize = () => {
    if (autoCapitalize) return autoCapitalize;

    switch (type) {
      case "email":
        return "none";
      default:
        return "sentences";
    }
  };

  return (
    <BaseInput
      {...props}
      ref={baseInputRef}
      keyboardType={getKeyboardType()}
      autoCapitalize={getAutoCapitalize()}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
});

// Add display name
TextInput.displayName = "TextInput";

export default TextInput;