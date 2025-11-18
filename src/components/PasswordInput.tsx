// src/components/PasswordInput.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { EyeOffIcon, EyeIcon } from "@/assets/images/icons/eye";
import BaseInput from "./BaseInput";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  style?: any;
  containerStyle?: any;
  showPasswordToggle?: boolean;
  editable?: boolean;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <BaseInput
        {...props}
        secureTextEntry={!isPasswordVisible}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[props.style, showPasswordToggle && styles.inputWithToggle]} // ← Now this works!
      />

      {showPasswordToggle && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? (
            <EyeOffIcon width={20} height={20} color="#666" />
          ) : (
            <EyeIcon width={20} height={20} color="#666" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    top: 40, // Adjust based on your label height
    right: 12,
    padding: 4,
  },
  inputWithToggle: {
    paddingRight: 50,
  },
});

export default PasswordInput;
