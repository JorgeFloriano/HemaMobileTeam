import React from "react";
import { Text, TextStyle, TouchableOpacity, ViewStyle, StyleSheet, StyleProp, View } from "react-native";

interface ButtonProps {
  title: string | React.ReactNode;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "icon";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>; // Tipagem melhorada
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  icon,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}) => {
  
  // Estilos base por variante
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "icon":
        return styles.icon;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.textSecondary;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton, 
        getVariantStyle(), 
        style, 
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7} // Feedback visual nativo
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        {/* Verifica se title é string para aplicar estilo, ou se é componente */}
        {typeof title === "string" ? (
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        ) : (
          title
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8, // Espaço fixo entre ícone e texto
  },
  primary: {
    backgroundColor: "#1b0363",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1b0363",
  },
  icon: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#1b0363",
  },
  textPrimary: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  textSecondary: {
    color: "#1b0363",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;