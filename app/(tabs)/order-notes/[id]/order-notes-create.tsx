import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, Text, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import api from "@/src/services/api";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import OptionSelector from "@/src/components/OptionSelector";
import KeyboardAvoindingContainer from "@/src/components/KeyboardAvoidingContainer";

interface Type {
  id: string;
  description: string;
}

interface FormData {
  order_type_id: string;
  sector: string;
  req_name: string;
  req_descr: string;
  equipment: string;
}

const CreateOrderScreen = () => {
  const router = useRouter();
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    order_type_id: "",
    sector: "",
    req_name: "",
    // req_date: new Date().toLocaleDateString("pt-BR"),
    // req_time: new Date().toLocaleTimeString("pt-BR", {
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // }),
    req_descr: "",
    equipment: "",
  });

  // FIXED: Added useCallback to prevent infinite re-renders
  const loadOrderTypes = useCallback(async () => {
    try {
      console.log("🔄 Loading order types...");

      const response = await api.get("/technician/orders/create");

      // Check if response has error
      if (response.data.error) {
        Alert.alert("Acesso Negado", response.data.error);
        router.back();
        return;
      }

      // FIXED: Better data handling
      const typesData = response.data.types || response.data;

      if (Array.isArray(typesData)) {
        setTypes(typesData);
        console.log(`✅ Loaded ${typesData.length} order types`);
      } else {
        console.warn("⚠️ Unexpected response format:", response.data);
        setTypes([]);
      }
    } catch (error: any) {
      console.error("❌ Error loading types:", error);

      let errorMessage = "Falha ao carregar tipos de serviços";

      if (error.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
        // Optional: Redirect to login
        // router.push('/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Erro", errorMessage);
    }
  }, [router]);

  // FIXED: Added proper useEffect dependency array
  useEffect(() => {
    loadOrderTypes();
  }, [loadOrderTypes]); // Now loadOrderTypes is stable due to useCallback

  const handleSubmit = async () => {
    if (!formData.order_type_id) {
      Alert.alert("Erro", "Por favor selecione um tipo de serviço");
      return;
    }

    if (!formData.req_descr) {
      Alert.alert("Erro", "Por favor descreva o serviço solicitado");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Laravel API endpoint, automatcally identifies the store function trough method as POST
      const response = await api.post("/technician/orders/", formData);

      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.push("/"); // Go back to previous screen
            },
          },
        ]);
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Falha ao criar ordem de serviço"
        );
      }
    } catch (error: any) {
      console.error("Error creating order:", error);

      // Handle validation errors from Laravel
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        Alert.alert("Erro", firstError[0]);
      } else {
        Alert.alert(
          "Erro",
          error.response?.data?.message || "Falha ao criar ordem de serviço"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      order_type_id: "",
      sector: "",
      req_name: "",
      // req_date: new Date().toLocaleDateString("pt-BR"),
      // req_time: new Date().toLocaleTimeString("pt-BR", {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   hour12: false,
      // }),
      req_descr: "",
      equipment: "",
    });
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: Type) => {
    updateFormData("order_type_id", type.id);
  };

  return (
    <KeyboardAvoindingContainer>
      <View style={styles.form}>
        <Text style={styles.welcome}>Abrir Solicitação</Text>
        <OptionSelector
          label="Tipo de Serviço *"
          placeholder="Selecione um tipo de serviço"
          types={types}
          selectedTypeId={formData.order_type_id}
          onTypeSelect={handleTypeSelect}
        />

        <TextInput
          label="Setor *"
          value={formData.sector}
          onChangeText={(text) => updateFormData("sector", text)}
          placeholder="Setor do atendimento"
          maxLength={30}
          type="text"
        />

        {/* <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  label="Data do Acionamento *"
                  value={formData.req_date}
                  onChangeText={(text) => updateFormData("req_date", text)}
                  placeholder="DD/MM/AAAA"
                  type="date"
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label="Hora do Acionamento *"
                  value={formData.req_time}
                  onChangeText={(text) => updateFormData("req_time", text)}
                  placeholder="HH:MM"
                  type="time"
                />
              </View>
            </View> */}

        <TextInput
          label="Descrição *"
          value={formData.req_descr}
          onChangeText={(text) => updateFormData("req_descr", text)}
          placeholder="Descreva a atividade a ser realizada"
          multiline
          numberOfLines={10}
          maxLength={470}
          type="text"
        />

        <TextInput
          label="Equipamento"
          value={formData.equipment}
          onChangeText={(text) => updateFormData("equipment", text)}
          placeholder="Informações do equipamento"
          maxLength={70}
          type="text"
        />

        <View style={styles.buttonGroup}>
          <Button
            title={loading ? "Criando..." : "Confirmar"}
            onPress={handleSubmit}
            variant="primary"
            disabled={loading}
          />
        </View>
      </View>
    </KeyboardAvoindingContainer>
  );
};

const styles = StyleSheet.create({
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 16,
    color: "#333",
  },

  form: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 16,
  },
});

export default CreateOrderScreen;
