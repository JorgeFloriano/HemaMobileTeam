import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";

interface Option {
  id: string | number;
  description: string;
}

interface OptionSelectorProps {
  options: Option[];
  selectedId: string;
  onSelect: (option: Option) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export interface OptionSelectorRef {
  focus: () => void;
  validate: () => boolean;
  clearError: () => void;
}

const OptionSelector = forwardRef<OptionSelectorRef, OptionSelectorProps>(
  (
    {
      options,
      selectedId,
      onSelect,
      label,
      placeholder,
      required = false,
      error = false,
      errorMessage = "Este campo é obrigatório",
    },
    ref,
  ) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [localError, setLocalError] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        setModalVisible(true);
      },
      validate: () => {
        const isValid = !required || !!selectedId;
        setLocalError(!isValid);
        return isValid;
      },
      clearError: () => {
        setLocalError(false);
      },
    }));

    const getSelectedOptionName = () => {
      if (!selectedId) return placeholder || "Selecione uma opção";

      const selected = options.find((option) => option.id === selectedId);

      if (!selected) return placeholder || "Selecione uma opção";

      // Verifica se o ID contém apenas caracteres numéricos
      const isNumeric = /^\d+$/.test(selected.id?.toString());

      return isNumeric
        ? `${selected.id} - ${selected.description}`
        : selected.description;
    };

    const handleOptionSelect = (option: Option) => {
      onSelect(option);
      setModalVisible(false);
      // Clear error when user selects an option
      if (localError) {
        setLocalError(false);
      }
    };

    const handleOpenModal = () => {
      setModalVisible(true);
      Keyboard.dismiss();
      // Clear error when user interacts with the selector
      if (localError) {
        setLocalError(false);
      }
    };

    const handleCloseModal = () => {
      setModalVisible(false);
      // Validate on close if required and no selection
      if (required && !selectedId) {
        setLocalError(true);
      }
    };

    const isError = localError || error;

    return (
      <View style={styles.inputGroup}>
        {label && (
          <View style={styles.labelContainer}>
            {required && <View style={styles.requiredDot} />}
            <Text style={[styles.label]}>
              {label}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.selectButton]}
          onPress={handleOpenModal}
        >
          <Text
            style={[
              styles.selectButtonText,
              !selectedId && styles.placeholderText,
              isError && styles.selectButtonTextError,
            ]}
          >
            {isError && !selectedId ? errorMessage : getSelectedOptionName()}
          </Text>
          <Text
            style={[styles.dropdownIcon, isError && styles.dropdownIconError]}
          >
            ▼
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {label || "Selecione uma opção"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.modalItem,
                      selectedId === option.id && styles.modalItemSelected,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    {/* Check if the id is a number, then display as "id - description" */}
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedId === option.id &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {/^\d+$/.test(option.id?.toString())
                        ? `${option.id} - ${option.description}`
                        : option.description}
                    </Text>
                    {selectedId === option.id && (
                      <Text style={styles.checkmark}>
                        <FontAwesome name="check" size={24} color="white" />
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

// Assign displayName to the component
OptionSelector.displayName = "OptionSelector";

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requiredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dc3545",
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
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
    flex: 1,
  },
  selectButtonTextError: {
    color: "#dc3545",
  },
  placeholderText: {
    color: "#6b7280",
  },
  dropdownIcon: {
    fontSize: 14,
    color: "#6b7280",
  },
  dropdownIconError: {
    color: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
    fontSize: 29,
    color: "#6b7280",
  },
  modalList: {
    maxHeight: 500,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemSelected: {
    backgroundColor: "#1b0363ff",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalItemTextSelected: {
    color: "white",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OptionSelector;
