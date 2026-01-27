// src/components/CheckboxInput.tsx
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type CheckboxInputProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(!value)} // Chama a função do pai diretamente
        style={styles.TouchableOpacity}
      >
        <View
          style={
            value ? styles.selectedCheckboxContainer : styles.checkboxContainer
          }
        >
          {value && <FontAwesome name="check" size={15} color="#1b0363ff" />}
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCheckboxContainer: {
    width: 24,
    height: 24,
    borderColor: "#1b0363ff",
    outlineColor: "#2809843e",
    outlineWidth: 3,
    outlineStyle: "solid",
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  TouchableOpacity: {
    flexDirection: "row",
    justifyContent: "center",
  },
  checkedText: {
    color: "#333",
    fontWeight: "600",
  },
});

export default CheckboxInput;
