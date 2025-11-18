// src/components/BaseInput.tsx
//import React, { useState } from "react";
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
  style?: StyleProp<TextStyle>; // ← Change from TextStyle to StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>; // ← Also fix containerStyle
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
}

const BaseInput: React.FC<BaseInputProps> = ({
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
}) => {
  const baseStyle: TextStyle = {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor:"#ced4da",
    borderRadius: 8,
    paddingLeft: 11,
    fontSize: 16,
    ...(isFocused && {
      borderColor: "#270984",
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

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#969a9fff"
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[baseStyle, style]} // ← Now this accepts arrays
        onFocus={onFocus}
        onBlur={onBlur}
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
});

export default BaseInput;