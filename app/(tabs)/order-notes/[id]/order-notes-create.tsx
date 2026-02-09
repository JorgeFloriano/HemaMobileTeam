import { useAuth } from "@/src/contexts/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Alert,
  StyleSheet,
  Text,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/src/services/api";
import Button from "@/src/components/Button";
import TextInput, { TextInputRef } from "@/src/components/TextInput";
import DateInput, { DateInputRef } from "@/src/components/DateInput";
import TimeInput, { TimeInputRef } from "@/src/components/TimeInput";
import OptionSelector, {
  OptionSelectorRef,
} from "@/src/components/OptionSelector";
import MaterialSelector, {
  MaterialSelectorRef,
} from "@/src/components/MaterialSelector";
import SignaturePad from "@/src/components/SignaturePad";
import KeyboardAvoindingContainer from "@/src/components/KeyboardAvoidingContainer";

interface Type {
  id: string;
  description: string;
}

interface Defect {
  id: string;
  description: string;
}

interface Cause {
  id: string;
  description: string;
}

interface Solution {
  id: string;
  description: string;
}

interface Material {
  id: string;
  description: string;
  unit: string;
}

interface Tec {
  id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
}

interface Order {
  id: string;
  client: {
    id: string;
    name: string;
    unit: string;
    address: string;
    contact: string;
  };
  type: {
    id: string;
    description: string;
  };
  tec: {
    id: string;
    user_id: string;
  } | null;
  req_name: string;
  sector: string;
  user: {
    name: string;
    surname: string;
  };
  req_date: string;
  req_time: string;
  req_descr: string;
  equipment: string;
  hasNotes: boolean;
}

interface FormData {
  order_id: string;
  equip_mod: string;
  equip_id: string;
  equip_type: string;
  note_type_id: string;
  defect_id: string;
  cause_id: string;
  solution_id: string;
  materials: any[];
  material_ids_array: string;
  services: string;
  date: string;
  go_start: string;
  go_end: string;
  start: string;
  end: string;
  back_start: string;
  back_end: string;
  first_tec: string;
  sign_t_1: string;
  second_tec: string;
  sign_t_2: string;
  cl_name: string;
  cl_function: string;
  cl_contact: string;
  sign_cl: string;
  finished: string;
}

interface ApiResponse {
  success: boolean;
  order: Order;
  tecs: Tec[];
  types: Type[];
  defects: Defect[];
  causes: Cause[];
  solutions: Solution[];
  materials: Material[];
}

const CreateOrderNoteScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [types, setTypes] = useState<Type[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tecs, setTecs] = useState<Tec[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const materialSelectorRef = useRef<MaterialSelectorRef>(null);
  const [showClientFields, setShowClientFields] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    order_id: Array.isArray(id) ? id[0] : id || "",
    equip_mod: "",
    equip_id: "",
    equip_type: "",
    note_type_id: "",
    defect_id: "",
    cause_id: "",
    solution_id: "",
    materials: [],
    material_ids_array: "",
    services: "",
    date: new Date().toLocaleDateString("pt-BR"), // dd/mm/yyyy
    go_start: "",
    go_end: "",
    start: new Date().toTimeString().slice(0, 5), // HH:MM
    end: new Date().toTimeString().slice(0, 5), // HH:MM
    back_start: "",
    back_end: "",
    first_tec: user?.tecId || "", // Auto-fill with authenticated user ID
    sign_t_1: "",
    second_tec: "0",
    sign_t_2: "",
    cl_name: "",
    cl_function: "",
    cl_contact: "",
    sign_cl: "",
    finished: "",
  });

  // const [formData, setFormData] = useState<FormData>({
  //   order_id: Array.isArray(id) ? id[0] : id || "",
  //   equip_mod: "Modelo test",
  //   equip_id: "99999",
  //   equip_type: "equip tipe test",
  //   note_type_id: "3",
  //   defect_id: "3",
  //   cause_id: "3",
  //   solution_id: "3",
  //   materials: [],
  //   material_ids_array: "",
  //   services: "Sevices test",
  //   date: new Date().toLocaleDateString("pt-BR"), // dd/mm/yyyy
  //   go_start: "",
  //   go_end: "",
  //   start: new Date().toTimeString().slice(0, 5), // HH:MM
  //   end: new Date().toTimeString().slice(0, 5), // HH:MM
  //   back_start: "",
  //   back_end: "",
  //   first_tec: "",
  //   sign_t_1: "",
  //   second_tec: "0",
  //   sign_t_2: "",
  //   cl_name: "",
  //   cl_function: "",
  //   cl_contact: "",
  //   sign_cl: "",
  //   finished: "",
  // });

  // Handle order notes back show
  const handleOrderNotesShow = () => {
    router.push(`/order-notes/${id}/order-notes-show`);
  };

  // Load all data with single API call
  const loadNoteCreationData = useCallback(async () => {
    try {
      setFormLoading(true);

      console.log(`🔄 Loading note creation data for order ${id}...`);

      // SINGLE API CALL - gets all data needed
      const response = await api.get<ApiResponse>(`/notes/create/${id}`);

      if (response.data.success) {
        setOrder(response.data.order);
        setTecs(response.data.tecs);
        setTypes(response.data.types);
        setDefects(response.data.defects);
        setCauses(response.data.causes);
        setSolutions(response.data.solutions);
        setMaterials(response.data.materials);

        console.log(
          `✅ Loaded data: ${response.data.types.length} types, ${response.data.tecs.length} techs, etc.`
        );
      } else {
        throw new Error("Failed to load note creation data");
      }
    } catch (error: any) {
      console.error("❌ Error loading note creation data:", error);

      let errorMessage = "Falha ao carregar dados do atendimento";

      if (error.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Erro", errorMessage);
      router.back();
    } finally {
      setFormLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadNoteCreationData();
  }, [loadNoteCreationData]);

  useEffect(() => {
    const stopNotifications = async () => {
      try {
        setIsVerifying(true);
        // Chamamos a API assim que o técnico "pisa" na tela da ordem
        // Para todos os fluxos de notificações de emergência da ordem
        // Atribui a ordem para o técnico logado
        await api.post("/technician/clear-emergency", {
          order_id: id, // o ID da ordem vindo da rota
        });

        setIsVerifying(false);
      } catch (error: any) {
        if (error.response?.status === 403) {
          Alert.alert(
            "SAT atribuída à outro técnico",
            "Outro técnico ou já iniciou o atendimento desta emergência ou SAT foi atribuída a ele por um supervisor.",
            [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
          );
        } else {
          console.error("Erro na verificação:", error);
          // Se for outro erro (ex: 500), você decide se deixa ele continuar ou volta
          setIsVerifying(false);
        }

        console.error(
          "Não foi possível parar os alertas e atribuir a ordem para o técnico logado",
          error
        );
      }
    };

    stopNotifications();
  }, [id]);

  const modEquipRef = useRef<TextInputRef>(null);
  const numEquipRef = useRef<TextInputRef>(null);
  const typeEquipRef = useRef<TextInputRef>(null);
  const typeRef = useRef<OptionSelectorRef>(null);
  const defectRef = useRef<OptionSelectorRef>(null);
  const causeRef = useRef<OptionSelectorRef>(null);
  const solutionRef = useRef<OptionSelectorRef>(null);
  const servicesRef = useRef<TextInputRef>(null);
  const dateRef = useRef<DateInputRef>(null);
  const startTimeRef = useRef<TimeInputRef>(null);
  const endTimeRef = useRef<TimeInputRef>(null);
  const firstTecRef = useRef<OptionSelectorRef>(null);

  // Handle materials change
  const handleMaterialsChange = (selectedMaterials: any[]) => {
    console.log("Selected materials:", selectedMaterials);

    // Update formData with the selected materials
    setFormData((prev) => ({
      ...prev,
      materials: selectedMaterials.map((material) => ({
        material_id: material.id,
        quantity: parseFloat(material.quantity) || 0,
      })),
      material_ids_array: selectedMaterials.map((m) => m.id).join(","),
    }));
  };

  // Handle signature saves
  const handleTec1Signature = (signatureData: string) => {
    updateFormData("sign_t_1", signatureData);
  };

  const handleTec2Signature = (signatureData: string) => {
    updateFormData("sign_t_2", signatureData);
  };

  const handleClientSignature = (signatureData: string) => {
    updateFormData("sign_cl", signatureData);
  };

  const handleSubmit = async () => {
    const isModEquipValid = modEquipRef.current?.validate();
    const isNumEquipValid = numEquipRef.current?.validate();
    const isTypeEquipValid = typeEquipRef.current?.validate();
    const isTypeValid = typeRef.current?.validate();
    const isDefectValid = defectRef.current?.validate();
    const isCauseValid = causeRef.current?.validate();
    const isSolutionValid = solutionRef.current?.validate();
    const isServicesValid = servicesRef.current?.validate();
    const isDateValid = dateRef.current?.validate();
    const isStartTimeValid = startTimeRef.current?.validate();
    const isEndTimeValid = endTimeRef.current?.validate();
    const isFirstTecValid = firstTecRef.current?.validate();

    if (
      !isStartTimeValid ||
      !isEndTimeValid ||
      !isDateValid ||
      !isTypeValid ||
      !isDefectValid ||
      !isModEquipValid ||
      !isNumEquipValid ||
      !isTypeEquipValid ||
      !isCauseValid ||
      !isSolutionValid ||
      !isServicesValid ||
      !isFirstTecValid
    ) {
      Alert.alert(
        "Erro",
        "Provavelmente alguns campos obrigatórios (com detalhes em vermelho) não foram preenchidos corretamente, por favor verifique e tente novamente!"
      );
      return;
    }

    // Signature validation
    if (!formData.sign_t_1) {
      Alert.alert("Erro", "Assinatura do Técnico 01 é obrigatória");
      return;
    }

    if (!formData.finished) {
      Alert.alert("Erro", "Por favor selecione se deseja salvar ou concluir");
      return;
    }

    // Prepare data for API - signatures are already base64 strings
    const submitData = {
      ...formData,
      // The signature fields are already base64 strings, ready for Laravel
    };

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await api.post("/notes", submitData);

      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              router.push("/");
            },
          },
        ]);
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Falha ao criar atendimento"
        );
      }
    } catch (error: any) {
      console.error("Error creating note:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        Alert.alert("Erro", firstError[0]);
      } else {
        Alert.alert(
          "Erro",
          error.response?.data?.message || "Falha ao criar atendimento"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Se estiver verificando, mostra o loading e não renderiza o formulário
  if (isVerifying) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1b0363ff" />
      </View>
    );
  }

  if (formLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando dados do atendimento...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoindingContainer>
      <View style={styles.form}>
        <Text style={styles.welcome}>SAT nº {id}</Text>

        {/* Order Information Card */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Cliente: </Text>
            {order?.client?.name}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Unidade: </Text>
            {order?.client?.unit}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Endereço: </Text>
            {order?.client?.address}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Contato: </Text>
            {order?.req_name}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Setor: </Text>
            {order?.sector}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Solicitante: </Text>
            {order?.user?.name || ""} {order?.user?.surname || ""}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Data e Hora: </Text>
            {formatDate(order?.req_date || "")} às{" "}
            {formatTime(order?.req_time || "")}
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.headerLabel}>Descrição da Solicitação: </Text>
            {order?.req_descr}
          </Text>
          <Text style={styles.headerLastText}>
            <Text style={styles.headerLabel}>Equipamento: </Text>
            {order?.equipment || ""}
          </Text>
        </View>
        {order?.hasNotes && (
          <Button
            title={"Ver anotações anteriores"}
            onPress={handleOrderNotesShow}
            variant="secondary"
            disabled={loading}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* Equipment Information */}
        <TextInput
          ref={modEquipRef}
          label="Modelo do Equipamento"
          value={formData.equip_mod}
          onChangeText={(text) => updateFormData("equip_mod", text)}
          placeholder="Modelo do Equipamento"
          maxLength={20}
          required
        />

        <TextInput
          ref={numEquipRef}
          label="Número de Identificação"
          value={formData.equip_id}
          onChangeText={(text) => updateFormData("equip_id", text)}
          placeholder="Número de Série"
          maxLength={20}
          required
        />

        <TextInput
          ref={typeEquipRef}
          label="Tipo do Equipamento"
          value={formData.equip_type}
          onChangeText={(text) => updateFormData("equip_type", text)}
          placeholder="Tipo"
          maxLength={20}
          required
        />

        {/* Selection Fields */}
        <OptionSelector
          ref={typeRef}
          label="Tipo de Atendimento"
          placeholder="Selecione o tipo de atendimento"
          options={types}
          selectedId={formData.note_type_id}
          onSelect={(item) => updateFormData("note_type_id", item.id)}
          required
        />

        <OptionSelector
          ref={defectRef}
          label="Defeito"
          placeholder="Selecione o defeito"
          options={defects}
          selectedId={formData.defect_id}
          onSelect={(item) => updateFormData("defect_id", item.id)}
          required
        />

        <OptionSelector
          ref={causeRef}
          label="Causa"
          placeholder="Selecione a causa"
          options={causes}
          selectedId={formData.cause_id}
          onSelect={(item) => updateFormData("cause_id", item.id)}
          required
        />

        <OptionSelector
          ref={solutionRef}
          label="Solução"
          placeholder="Selecione a solução"
          options={solutions}
          selectedId={formData.solution_id}
          onSelect={(item) => updateFormData("solution_id", item.id)}
          required
        />

        <MaterialSelector
          ref={materialSelectorRef}
          materials={materials as Material[]}
          placeholder="Selecionar Material"
          onMaterialsChange={handleMaterialsChange}
        />

        {/* Services Description */}
        <TextInput
          ref={servicesRef}
          label="Descrição dos Serviços Executados"
          value={formData.services}
          onChangeText={(text) => updateFormData("services", text)}
          placeholder="Serviços executados"
          multiline
          numberOfLines={4}
          maxLength={1290}
          required
        />

        {/* Date and Time Sections */}
        <DateInput
          ref={dateRef}
          label="Data do Atendimento"
          value={formData.date}
          onChangeText={(text) => updateFormData("date", text)}
          placeholder="DD/MM/AAAA"
          required
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TimeInput
              label="Saída (Ida)"
              value={formData.go_start}
              onChangeText={(text) => updateFormData("go_start", text)}
              placeholder="HH:MM"
            />
          </View>
          <View style={styles.halfInput}>
            <TimeInput
              label="Chegada (Ida)"
              value={formData.go_end}
              onChangeText={(text) => updateFormData("go_end", text)}
              placeholder="HH:MM"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TimeInput
              ref={startTimeRef}
              label="Início (execução)"
              value={formData.start}
              onChangeText={(text) => updateFormData("start", text)}
              placeholder="HH:MM"
              required
            />
          </View>
          <View style={styles.halfInput}>
            <TimeInput
              ref={endTimeRef}
              label="Fim (execução)"
              value={formData.end}
              onChangeText={(text) => updateFormData("end", text)}
              placeholder="HH:MM"
              required
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TimeInput
              label="Saída (Volta)"
              value={formData.back_start}
              onChangeText={(text) => updateFormData("back_start", text)}
              placeholder="HH:MM"
            />
          </View>
          <View style={styles.halfInput}>
            <TimeInput
              label="Chegada (Volta)"
              value={formData.back_end}
              onChangeText={(text) => updateFormData("back_end", text)}
              placeholder="HH:MM"
            />
          </View>
        </View>

        {/* Technicians Selection */}
        {/* Technician 1 */}
        <View style={styles.tecRow}>
          <View style={styles.inputRow}>
            <OptionSelector
              ref={firstTecRef}
              label="Técnico 01"
              placeholder="Selecione o técnico principal"
              options={tecs.map((tec) => ({
                id: tec.id,
                description: `${tec.user.name} ${tec.user.surname}`,
              }))}
              selectedId={formData.first_tec}
              onSelect={(item) => updateFormData("first_tec", item.id)}
              required
            />
          </View>
          <View style={styles.buttonRow}>
            <SignaturePad
              title="Assinatura do Técnico 01"
              onSave={handleTec1Signature}
              //required={true}
            />
          </View>
        </View>

        {/* Technician 2 */}
        <View style={styles.tecRow}>
          <View style={styles.inputRow}>
            <OptionSelector
              label="Técnico 02"
              placeholder="Selecione o técnico 02"
              options={[
                { id: "0", description: "Selecione o Técnico 02" },
                ...tecs.map((tec) => ({
                  id: tec.id,
                  description: `${tec.user.name} ${tec.user.surname}`,
                })),
              ]}
              selectedId={formData.second_tec}
              onSelect={(item) => updateFormData("second_tec", item.id)}
            />
          </View>
          <View style={styles.buttonRow}>
            {/* Technician 2 Signature */}
            <SignaturePad
              title="Assinatura do Técnico 02"
              onSave={handleTec2Signature}
            />
          </View>
        </View>

        {/* Client Fields - Conditionally Rendered */}
        {showClientFields && (
          <View>
            {/* Client */}
            <View style={styles.tecRow}>
              <View style={styles.inputRow}>
                <TextInput
                  label="Nome do Cliente"
                  value={formData.cl_name}
                  onChangeText={(text) => updateFormData("cl_name", text)}
                  placeholder="Nome do cliente"
                  maxLength={40}
                />
              </View>
              <View style={styles.buttonRow}>
                <SignaturePad
                  title="Assinatura do Cliente"
                  onSave={handleClientSignature}
                />
              </View>
            </View>

            <TextInput
              label="Função"
              value={formData.cl_function}
              onChangeText={(text) => updateFormData("cl_function", text)}
              placeholder="Função do cliente"
              maxLength={40}
            />

            <TextInput
              label="Contato"
              value={formData.cl_contact}
              onChangeText={(text) => updateFormData("cl_contact", text)}
              placeholder="Contato do cliente"
              maxLength={40}
            />
            
          </View>
        )}

        {/* Finish Options */}
        <Text style={styles.sectionTitle}>Status do Atendimento</Text>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => {
            updateFormData("finished", "0");
            setShowClientFields(false); // Hide client fields for "Salvar"
          }}
        >
          <View
            style={[
              styles.radio,
              formData.finished === "0" && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioLabel}>
            <FontAwesome name="save" size={24} color="black" /> - Salvar
            (atendimento pendente)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => {
            updateFormData("finished", "1");
            setShowClientFields(true); // Show client fields for "Concluir"
          }}
        >
          <View
            style={[
              styles.radio,
              formData.finished === "1" && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioLabel}>
            <FontAwesome name="check-square-o" size={24} color="black" /> -
            Concluir (atendimento finalizado)
          </Text>
        </TouchableOpacity>
        <Button
          title={loading ? "Processando..." : "Confirmar"}
          icon={<FontAwesome name="check" size={24} color="white" />}
          onPress={handleSubmit}
          variant="primary"
          disabled={loading}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAvoindingContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    padding: 16,
    paddingTop: 60,
  },

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
    color: "#333",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "black",
  },

  headerLabel: {
    fontWeight: "600",
  },

  headerLastText: {
    fontSize: 16,
    color: "#333",
    padding: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },

  tecRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  inputRow: {
    flex: 1,
  },
  buttonRow: {
    alignItems: "flex-end",
    //height: 64,
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ced4da",
    marginRight: 12,
  },
  radioSelected: {
    outlineColor: "#2809843e",
    outlineWidth: 3,
    outlineStyle: "solid",
    borderWidth: 6,
    borderColor: "black",
    backgroundColor: "white",
  },

  radioLabel: {
    fontSize: 16,
    color: "#333",
  },

  submitButton: {
    marginTop: 16,
    width: "auto",
    alignSelf: "flex-start",
  },

  signatureSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },

  signatureLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  signatureStatus: {
    fontSize: 14,
    color: "#28a745",
    marginTop: 8,
  },
  signatureStatusError: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 8,
  },
  previewContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  previewImage: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  previewText: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
});

export default CreateOrderNoteScreen;
