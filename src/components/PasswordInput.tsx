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
    <View style={[styles.mainContainer, props.containerStyle]}>
      {/* O container interno isola o input e o ícone do Label */}
      <View style={styles.inputWrapper}>
        <BaseInput
          {...props}
          containerStyle={null} // Evita margens duplicadas se o BaseInput tiver estilo de container
          secureTextEntry={!isPasswordVisible}
          isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none" // Essencial para senhas
          autoCorrect={false}
          style={[props.style, showPasswordToggle && styles.inputWithToggle]}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOffIcon width={22} height={22} color={isFocused ? "#1b0363ff" : "#666"} />
            ) : (
              <EyeIcon width={22} height={22} color={isFocused ? "#1b0363ff" : "#666"} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    justifyContent: "center", // Centraliza o ícone verticalmente em relação ao input
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    // Removido o top fixo. Agora ele se baseia no final do componente.
    // Se o seu BaseInput tem label dentro, este valor deve ser ajustado
    // mas o ideal é que o Label esteja fora do inputWrapper.
    right: 12,
    bottom: 29, // Alinha com o preenchimento inferior do BaseInput
    zIndex: 10,
  },
  inputWithToggle: {
    paddingRight: 45,
  },
});

export default PasswordInput;