// app/(tabs)/on-call/index.tsx
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
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "@/src/services/api";
import OnCallTecCard from "@/src/components/OnCallTecCard";
import { FontAwesome } from "@expo/vector-icons";
import CheckboxInput from "@/src/components/CheckboxInput";
import Button from "@/src/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";

const OnCallScreen = () => {
  const [tecs, setTecs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTec, setSelectedTec] = useState<any>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Função para fazer logout
  const performLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Se não tiver permissão, vai para a home
  useEffect(() => {
    if (!user?.onCallPermission) {
      router.replace("/(tabs)");
      return;
    }
    loadInitialData();
  }, []);

  const handleError = (err: any, message: string) => {
    console.error(message, err);
    const isSup = err.response?.data?.isSup;
    const errorMessage = err.response?.data?.message || message;
    if (isSup === false) {
      performLogout();
      return;
    }
    Alert.alert("Erro", errorMessage);
  };

  const toggleAllClients = () => {
    // Se o número de selecionados for igual ao total de clientes, desmarcamos todos
    if (tempSelectedIds.length === clients.length) {
      setTempSelectedIds([]);
    } else {
      // Caso contrário, selecionamos todos os IDs disponíveis
      const allIds = clients.map((c: any) => c.id);
      setTempSelectedIds(allIds);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const [resTecs, resClients] = await Promise.all([
        api.get("/emergency/tecs"),
        api.get("/emergency/clients"),
      ]);
      setTecs(resTecs.data);
      setClients(resClients.data);
    } catch (err: any) {
      handleError(err, "Erro ao carregar dados iniciais");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const openClientModal = (tec: any) => {
    setSelectedTec(tec);
    // Agora mapeamos os objetos que vêm do Laravel para um array de IDs
    const currentIds = tec.emergency_clients?.map((c: any) => c.id) || [];
    setTempSelectedIds(currentIds);
    setModalVisible(true);
  };

  const toggleClient = (clientId: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId],
    );
  };

  const handleViewOrder = (orderId: number | string) => {
    router.push(`/order-sat/${orderId}/order-sat-show`);
  };

  const handleSave = async () => {
    try {
      await api.put(`/emergency/tecs/${selectedTec.id}/clients`, {
        clients: tempSelectedIds,
      });
      Alert.alert("Sucesso", "Vínculos atualizados!");
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      handleError(err, "Erro ao atualizar vínculos clientes/técnicos");
    }
  };

  const toggleOnCall = async (tecId: number, value: boolean) => {
    try {
      await api.put(`/emergency/tecs/${tecId}/toggle`, { on_call: value });
      loadData();
    } catch (err: any) {
      handleError(err, "Erro ao atualizar condição de sobreaviso");
    }
  };

  // Se estiver carregando pela primeira vez
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1b0363ff" />
        <Text style={styles.loadingText}>Carregando colaboradores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sobreaviso Emergencial</Text>
        <Text style={styles.infoText}>
          Técnicos ATIVOS recebem alertas de SATs fora do horário comercial se o
          CLIENTE estiver vinculado e se estiver DISPONÍVEL (não está ocupado em
          outra SAT emergencial).
        </Text>
      </View>

      <FlatList
        data={tecs}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <OnCallTecCard
            tec={item}
            onToggleActive={(val) => toggleOnCall(item.id, val)}
            onManageClients={() => openClientModal(item)} // Corrigido para usar a função que abre o modal corretamente
            onViewOrder={(id) => handleViewOrder(id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1b0363ff"]}
            tintColor="#1b0363ff"
          />
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                {/* flex: 1 para não empurrar o 'X' */}
                <Text style={styles.modalTitleText}>
                  {selectedTec?.user.name}
                </Text>
                <Text style={styles.modalSub}>
                  Gerenciar clientes vinculados
                </Text>
                <Button
                  title={
                    tempSelectedIds.length === clients.length
                      ? "Desmarcar todos"
                      : "Selecionar todos"
                  }
                  icon={
                    <FontAwesome
                      name={
                        tempSelectedIds.length === clients.length
                          ? "square-o"
                          : "check-square-o"
                      }
                      size={18}
                      color="#1b0363ff"
                    />
                  }
                  onPress={toggleAllClients}
                  variant="secondary"
                  style={styles.toggleAllBtn}
                  textStyle={{ fontSize: 13 }}
                />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
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
  infoText: { fontSize: 14, color: "#666", lineHeight: 18 },
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

  modalList: { paddingHorizontal: 16, paddingTop: 5 },
  modalFooter: {
    justifyContent: "flex-end",
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  cancelBtn: { flex: 1, padding: 12, alignItems: "center" },
  cancelBtnText: { color: "#999", fontWeight: "bold" },
  saveBtn: {
    padding: 12,
    width: "auto",
    flex: 1,
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  toggleAllBtn: {
    marginTop: 10,
    paddingVertical: 6, // Mais fino que o botão padrão
    paddingHorizontal: 12,
    alignSelf: "flex-start", // Não ocupa a largura toda
    height: "auto",
    minHeight: 35,
  },
});

export default OnCallScreen;
