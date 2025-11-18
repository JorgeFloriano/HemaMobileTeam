// src/components/TextInput.tsx
import React, { useState } from "react";
import BaseInput from "./BaseInput";
import { TextStyle, ViewStyle, StyleProp } from "react-native";

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>; // ← Add this
  containerStyle?: StyleProp<ViewStyle>; // ← And this
  type?: "text" | "email" | "number";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  keyboardType?: any;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
}

const TextInput: React.FC<TextInputProps> = ({
  type = "text",
  keyboardType,
  autoCapitalize,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
      keyboardType={getKeyboardType()}
      autoCapitalize={getAutoCapitalize()}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

export default TextInput;
