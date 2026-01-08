import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import api from "@/src/services/api";
import OnCallTecCard from "@/src/components/OnCallTecCard";
import { FontAwesome } from "@expo/vector-icons";
import CheckboxInput from "@/src/components/CheckboxInput";
import Button from "@/src/components/Button";

const OnCallScreen = () => {
  const [tecs, setTecs] = useState([]);
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTec, setSelectedTec] = useState<any>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Quando o Laravel estiver pronto, use:
      // const [resTecs, resClients] = await Promise.all([
      //   api.get("/emergency/tecs"),
      //   api.get("/emergency/clients"),
      // ]);
      // setTecs(resTecs.data);
      // setClients(resClients.data);

      // MOCK PARA TESTE (APAGUE QUANDO TIVER API):
      setTecs([
        {
          id: 1,
          on_call: 1,
          emergency_order_id: null,
          user: { name: "Jorge", function: "TI" },
          emergency_clients: [],
        },
        {
          id: 2,
          on_call: 0,
          emergency_order_id: null,
          user: { name: "João", function: "TI" },
          emergency_clients: [],
        },
        {
          id: 3,
          on_call: 1,
          emergency_order_id: 6645,
          user: { name: "Maria", function: "TI" },
          emergency_clients: [],
        },
      ]);
      setClients([
        {
          id: 101,
          name: "Cliente Teste",
        },
        {
          id: 102,
          name: "Cliente Teste 2",
        },
        {
          id: 103,
          name: "Cliente Teste 3",
        },
        {
          id: 104,
          name: "Cliente Teste 4",
        },
        {
          id: 105,
          name: "Cliente Teste 5",
        },
        {
          id: 106,
          name: "Cliente Teste 6",
        },
        {
          id: 107,
          name: "Cliente Teste 7",
        },
        {
          id: 108,
          name: "Cliente Teste 8",
        },
        {
          id: 109,
          name: "Cliente Teste 9",
        },
        {
          id: 110,
          name: "Cliente Teste 10",
        },
        {
          id: 111,
          name: "Cliente Teste 11",
        },
        {
          id: 112,
          name: "Cliente Teste 12",
        },
        {
          id: 113,
          name: "Cliente Teste 13",
        },
        {
          id: 114,
          name: "Cliente Teste 14",
        },
        {
          id: 115,
          name: "Cliente Teste 15",
        },
        {
          id: 116,
          name: "Cliente Teste 16",
        },
        {
          id: 117,
          name: "Cliente Teste 17",
        },
        {
          id: 118,
          name: "Cliente Teste 18",
        },
        {
          id: 119,
          name: "Cliente Teste 19",
        },
        {
          id: 120,
          name: "Cliente Teste 20",
        },
      ]);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  const openClientModal = (tec: any) => {
    setSelectedTec(tec);
    const currentIds = tec.emergency_clients?.map((c: any) => c.id) || [];
    setTempSelectedIds(currentIds);
    setModalVisible(true);
  };

  const toggleClient = (clientId: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSave = async () => {
    try {
      // await api.put(`/emergency/tecs/${selectedTec.id}/clients`, { clients: tempSelectedIds });
      Alert.alert("Sucesso", "Vínculos atualizados!");
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const toggleOnCall = async (tecId: number, value: boolean) => {
    try {
      // await api.put(`/emergency/tecs/${tecId}/toggle`, { on_call: value });
      loadData();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível alterar o status.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sobreaviso Emergencial</Text>
        <Text style={styles.infoText}>
          Técnicos ativos recebem alertas de SATs fora do horário
          comercial conforme a disponibilidade e cliente vinculado.
        </Text>
      </View>

      <FlatList
        data={tecs}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <OnCallTecCard
            tec={item}
            onToggleActive={(val) => toggleOnCall(item.id, val)}
            onManageClients={() => openClientModal(item)} // Corrigido para usar a função que abre o modal corretamente
            onViewOrder={(id) => console.log(id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitleText}>Vincular Clientes</Text>
                <Text style={styles.modalSub}>{selectedTec?.user.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertBox}>
              <FontAwesome name="info-circle" size={16} color="#007AFF" />
              <Text style={styles.alertText}>
                Máximo de 3 clientes por técnico recomendado.
              </Text>
            </View>

            <ScrollView style={styles.modalList}>
              {clients.map((client: any) => (
                <CheckboxInput
                  key={client.id}
                  label={client.name}
                  value={tempSelectedIds.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={"Fechar"}
                icon={<FontAwesome name="times" size={24} color="#1b0363ff" />}
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={styles.saveBtn}
              />
              <Button
                title={"Salvar Todos"}
                icon={<FontAwesome name="save" size={24} color="white" />}
                onPress={handleSave}
                variant="primary"
                style={styles.saveBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  header: { paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#666", lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  modalTitleText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  modalSub: { fontSize: 14, color: "#666" },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 29,
    color: "#6b7280",
  },
  alertBox: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 12,
    margin: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  alertText: { marginLeft: 10, color: "#1b0363ff", fontSize: 12, flex: 1 },
  modalList: { paddingHorizontal: 16 },
  modalFooter: {
    justifyContent: "flex-end",
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  cancelBtn: { flex: 1, padding: 12, alignItems: "center" },
  cancelBtnText: { color: "#999", fontWeight: "bold" },
  saveBtn: {
    marginTop: 16,
    width: "auto",
    alignSelf: "flex-start",
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default OnCallScreen;
