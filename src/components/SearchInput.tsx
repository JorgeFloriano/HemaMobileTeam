import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Button from "./Button"; // Ajuste o caminho conforme seu projeto

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  keyboardType?: "numeric" | "default";
  loading?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = "Buscar nº",
  containerStyle,
  keyboardType = "numeric",
  loading = false,
}) => {

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#969a9fff"
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />

      <Button
        variant="icon"
        title=""
        icon={
          <FontAwesome
            name="search"
            size={22}
            color={"#1b0363"}
          />
        }
        onPress={onSearch}
        disabled={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "stretch", // Garante que ambos tenham a mesma altura
    // Sombra leve para dar profundidade
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  input: {
    flex: 1, // Ocupa o espaço restante
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#270984",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 11,
    fontSize: 16,
    color: "#333",
    borderRightWidth: 0, // Remove a borda direita para "colar" no botão
  },

  inputFocused: {
    borderColor: "#270984",
    outlineColor: "#2809843e",
    outlineWidth: 3,
    outlineStyle: "solid",
    paddingLeft: 12,
  },

  button: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: "#270984",
    backgroundColor: "#fff",
    borderWidth: 1,
    minWidth: 50
  },
});

export default SearchInput;
