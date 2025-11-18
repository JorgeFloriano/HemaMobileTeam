import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Type {
  id: string;
  description: string;
}

interface OptionSelectorProps {
  types: Type[];
  selectedTypeId: string;
  onTypeSelect: (type: Type) => void;
  label?: string;
  placeholder?: string;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  types,
  selectedTypeId,
  onTypeSelect,
  label,
  placeholder,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getSelectedTypeName = () => {
    if (!selectedTypeId) return placeholder || "Selecione uma opção";
    const selected = types.find((type) => type.id === selectedTypeId);
    return selected ? selected.description : placeholder || "Selecione uma opção";
  };

  const handleTypeSelect = (type: Type) => {
    onTypeSelect(type);
    setModalVisible(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selectedTypeId && styles.placeholderText,
          ]}
        >
          {getSelectedTypeName()}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma opção</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {types.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalItem,
                    selectedTypeId === type.id && styles.modalItemSelected,
                  ]}
                  onPress={() => handleTypeSelect(type)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedTypeId === type.id &&
                        styles.modalItemTextSelected,
                    ]}
                  >
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  selectButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#6b7280",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#6b7280",
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemSelected: {
    backgroundColor: "#1b0363ff",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalItemTextSelected: {
    color: "white",
  },
});

export default OptionSelector;
