import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome";

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
  const [isChecked, setIsChecked] = useState(value);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onChange(!isChecked);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleCheckboxChange}
        style={styles.TouchableOpacity}
      >
        <View style={styles.checkboxContainer}>
          {isChecked ? (
            <Text style={styles.checkedText}>
              <FontAwesome6 name="check" size={15} color="black" />
            </Text>
          ) : null}
        </View>
        <Text style={styles.label}> {label}</Text>
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
