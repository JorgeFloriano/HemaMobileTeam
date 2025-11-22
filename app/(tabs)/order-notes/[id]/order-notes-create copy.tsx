import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, Text, Keyboard } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/src/services/api";
import TextInput from "@/src/components/TextInput";
import DateInput from "@/src/components/DateInput";
import TimeInput from "@/src/components/TimeInput";
import Button from "@/src/components/Button";
import OptionSelector from "@/src/components/OptionSelector";
import KeyboardAvoindingContainer from "@/src/components/KeyboardAvoidingContainer";

interface Type {
  id: string;
  description: string;
}

interface FormData {
  note_type_id: string;
  sector: string;
  req_name: string;
  req_descr: string;
  equipment: string;
  req_date: string;
  req_time: string;
}

const CreateOrderNoteScreen = () => {
  const router = useRouter();
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    note_type_id: "",
    sector: "",
    req_name: "",
    req_date: new Date().toLocaleDateString("pt-BR"),
    req_time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    req_descr: "",
    equipment: "",
  });

  // FIXED: Added useCallback to prevent infinite re-renders
  const loadOrderTypes = useCallback(async () => {
    try {
      console.log("🔄 Loading order types...");

      const response = await api.get("/technician/orders/create");

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
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router]);

  // FIXED: Added proper useEffect dependency array
  useEffect(() => {
    loadOrderTypes();
  }, [loadOrderTypes]); // Now loadOrderTypes is stable due to useCallback

  const handleSubmit = async () => {
    if (!formData.note_type_id) {
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
      note_type_id: "",
      sector: "",
      req_name: "",
      req_date: new Date().toLocaleDateString("pt-BR"),
      req_time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      req_descr: "",
      equipment: "",
    });
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: Type) => {
    updateFormData("note_type_id", type.id);
  };

  return (
    <KeyboardAvoindingContainer>
      <View style={styles.form}>
        <Text style={styles.welcome}>SAT nº {id}</Text>

        <View style={styles.header}>
          <Text style={styles.headerText}>Cliente: {order?.client?.name}</Text>
          <Text style={styles.headerText}>Unidade: {order?.client?.unit}</Text>
          <Text style={styles.headerText}>Endereço: {order?.client?.address}</Text>
          <Text style={styles.headerText}>Contato: {order?.req_name}</Text>
          <Text style={styles.headerText}>Setor: {order?.sector}</Text>
          <Text style={styles.headerText}>Solicitante: {order?.user?.name || ""}</Text>
          <Text style={styles.headerText}>Data e Hora: {formatDate(order?.req_date || "")} ás {formatTime(order?.req_time || "")}</Text>
          <Text style={styles.headerText}>Descrição da Solicitação: {order?.req_descr}</Text>
          <Text style={styles.headerLastText}>Equipamento: {order?.equipment || ""}</Text>
        </View>

        <OptionSelector
          label="Tipo de Serviço *"
          placeholder="Selecione um tipo de serviço"
          options={types}
          selectedId={formData.note_type_id}
          onSelect={handleTypeSelect}
        />

        <TextInput
          label="Setor *"
          value={formData.sector}
          onChangeText={(text) => updateFormData("sector", text)}
          placeholder="Setor do atendimento"
          maxLength={30}
          type="text"
        />

        <DateInput
          label="Data do Acionamento *"
          value={formData.req_date}
          onChangeText={(text) => updateFormData("req_date", text)}
          placeholder="DD/MM/AAAA"
        />

        <TimeInput
          label="Hora do Acionamento *"
          value={formData.req_time}
          onChangeText={(text) => updateFormData("req_time", text)}
          placeholder="HH:MM"
        />

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

  header: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    marginBottom: 16,
  },

  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "black",
  },

  headerLastText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 10,
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

export default CreateOrderNoteScreen;
