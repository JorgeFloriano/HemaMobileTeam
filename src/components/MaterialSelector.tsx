// src/components/MaterialSelector.tsx
import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import OptionSelector, { OptionSelectorRef } from "./OptionSelector";
import TextInput from "./TextInput";

interface Material {
  id: string;
  description: string;
  unit: string;
}

interface SelectedMaterial {
  id: string;
  description: string;
  unit: string;
  quantity: string;
  key: string; // Unique key for the item
}

interface MaterialSelectorProps {
  materials: Material[];
  label?: string;
  placeholder?: string;
  onMaterialsChange?: (materials: SelectedMaterial[]) => void;
}

export interface MaterialSelectorRef {
  getSelectedMaterials: () => SelectedMaterial[];
  validate: () => boolean;
  clearAll: () => void;
}

const MaterialSelector = forwardRef<MaterialSelectorRef, MaterialSelectorProps>(
  (
    { materials, placeholder = "Selecione um material", onMaterialsChange },
    ref
  ) => {
    const [selectedMaterials, setSelectedMaterials] = useState<
      SelectedMaterial[]
    >([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
    const optionSelectorRef = React.useRef<OptionSelectorRef>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getSelectedMaterials: () => selectedMaterials,
      validate: () => true, // Always valid since materials are optional
      clearAll: () => setSelectedMaterials([]),
    }));

    // Handle material selection
    const handleMaterialSelect = (material: {
      id: string | number;
      description: string;
    }) => {
      const selectedMaterial = materials.find((m) => m.id === material.id);

      if (!selectedMaterial) return;

      // Check if material is already added
      const isAlreadyAdded = selectedMaterials.some(
        (m) => m.id === material.id
      );

      if (isAlreadyAdded) {
        Alert.alert(
          "Material já adicionado",
          "Este material já foi adicionado. Utilize o campo numérico para alterar a quantidade.",
          [{ text: "OK" }]
        );
        setSelectedMaterialId("");
        optionSelectorRef.current?.clearError();
        return;
      }

      // Add new material with default quantity of 1
      const newMaterial: SelectedMaterial = {
        ...selectedMaterial,
        quantity: "1",
        key: `${material.id}-${Date.now()}`, // Unique key for the item
      };

      const updatedMaterials = [...selectedMaterials, newMaterial];
      setSelectedMaterials(updatedMaterials);
      setSelectedMaterialId("");

      // Notify parent component
      onMaterialsChange?.(updatedMaterials);
    };

    // Handle quantity change
    const handleQuantityChange = (materialId: string, quantity: string) => {
      // If quantity is empty or zero, remove the material
      if (quantity === "0") {
        removeMaterial(materialId);
        return;
      }

      // Update quantity
      const updatedMaterials = selectedMaterials.map((material) =>
        material.id === materialId ? { ...material, quantity } : material
      );

      setSelectedMaterials(updatedMaterials);
      onMaterialsChange?.(updatedMaterials);
    };

    // Remove material from list
    const removeMaterial = (materialId: string) => {
      const updatedMaterials = selectedMaterials.filter(
        (material) => material.id !== materialId
      );
      setSelectedMaterials(updatedMaterials);
      onMaterialsChange?.(updatedMaterials);
    };

    // Get selected material IDs as comma-separated string (like your original functionality)
    // const getMaterialIdsArray = () => {
    //   return selectedMaterials.map((material) => material.id).join(",");
    // };

    return (
      <View>
        {/* Material Selection */}
        <OptionSelector
          ref={optionSelectorRef}
          options={materials}
          selectedId={selectedMaterialId.toString()}
          onSelect={handleMaterialSelect}
          placeholder={placeholder}
          label="Registrar Materiais Utilizados"
        />

        {/* Selected Materials List */}
        {selectedMaterials.length > 0 && (
          <View style={styles.materialsList}>
            <ScrollView style={styles.scrollView}>
              {selectedMaterials.map((material) => (
                <MaterialItem
                  key={material.key}
                  material={material}
                  onQuantityChange={handleQuantityChange}
                  onRemove={removeMaterial}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Hidden field equivalent (for form data) */}
        {/* <TextInput
          onChangeText={getMaterialIdsArray}
          style={styles.hiddenInput}
          value={getMaterialIdsArray()}
          editable={false}
        /> */}

      </View>
    );
  }
);

// Individual Material Item Component
interface MaterialItemProps {
  material: SelectedMaterial;
  onQuantityChange: (materialId: string, quantity: string) => void;
  onRemove: (materialId: string) => void;
}

const MaterialItem: React.FC<MaterialItemProps> = ({
  material,
  onQuantityChange,
  onRemove,
}) => {
  const [quantity, setQuantity] = useState(material.quantity);

  const handleQuantityChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, "");
    setQuantity(cleanedText);

    // Update parent immediately for real-time validation
    onQuantityChange(material.id, cleanedText);
  };

  return (
    <View style={styles.materialItem}>
      {/* Material Description */}
      <View style={styles.materialDescription}>
        <Text style={styles.materialText} numberOfLines={2}>
          {material.description}
        </Text>
      </View>

      {/* Quantity Input */}
      <TextInput
        style={styles.quantityInput}
        value={quantity}
        onChangeText={handleQuantityChange}
        placeholder="Qtd"
        keyboardType="decimal-pad"
      />

      {/* Unit */}
      <View style={styles.unitContainer}>
        <Text style={styles.unitText}>{material.unit}</Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(material.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // hiddenInput: {
  //   display: "none",
  //   padding: 0,
  //   margin: 0,
  // },

  materialsList: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 20,
  },
  
  scrollView: {
    paddingTop: 6,
  },
  materialItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  materialDescription: {
    flex: 1,
    marginRight: 12,
  },
  materialText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  quantityInput: {
    width: 60,
  },
  unitContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#333",
    fontSize: 24,
    lineHeight: 18,
  },
});

// Add display name
MaterialSelector.displayName = "MaterialSelector";

export default MaterialSelector;
