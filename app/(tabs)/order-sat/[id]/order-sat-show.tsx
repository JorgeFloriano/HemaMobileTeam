import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/src/services/api";
import Button from "@/src/components/Button";
import { Order } from "@/app/(tabs)/order-notes";
import { FontAwesome6 } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Adicione o import
import TextInput from "@/src/components/TextInput";

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [equipmentText, setEquipmentText] = useState("");
  const [savingEq, setSavingEq] = useState(false);

  // Adicione estados para as novas permissões que precisar
  const [permissions, setPermissions] = useState({
    reopen_sat: false,
    sats: false,
  });

  // Load order details
  const loadOrder = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.get<{ order: Order }>(`/notes/show/${id}`);
      setOrder(response.data.order);
      console.log("Order loaded:", response.data.order);
    } catch (error: any) {
      if (error.response?.data?.error) {
        // Check if response has error
        Alert.alert("Acesso Negado", error.response.data.error);
        router.back();
        return;
      }
      Alert.alert("Error", "Falha ao carregar dados do serviço");
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }; // Add dependencies that loadOrder uses

  const checkPermissions = async () => {
    try {
      const response = await api.get("/user-permissions", {
        params: {
          // Passando como string separada por vírgula é mais fácil para o Axios
          names: "reopen_sat,sats",
          level: 2,
        },
      });

      console.log("DEBUG API PERMISSIONS:", response.data);

      // A resposta será algo como: { attach_tec: true, reopen_sat: false }
      setPermissions(response.data);
    } catch (error) {
      console.error("Erro ao checar permissões em lote:", error);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // 1. Busque o token exatamente como o seu interceptor faz
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert(
          "Erro",
          "Sessão expirada. Por favor, faça login novamente.",
        );
        return;
      }

      const filename = `SAT_${id}.pdf`;
      const fileUri = FileSystem.cacheDirectory + filename;

      // 1. Inicia o download do arquivo binário
      // O downloadResumable lida melhor com o fluxo de dados da API
      const downloadInstance = FileSystem.createDownloadResumable(
        `${api.defaults.baseURL}/sat/orders/${id}/download`,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Injeta o token aqui
            Accept: "application/pdf",
          },
        },
      );

      const result = await downloadInstance.downloadAsync();

      if (result && result.status === 200) {
        // 2. Abre o menu de compartilhamento do celular para abrir o PDF
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: "application/pdf",
            dialogTitle: `Abrir Relatório SAT ${id}`,
            UTI: "com.adobe.pdf", // Para compatibilidade com iOS
          });
        } else {
          Alert.alert(
            "Sucesso",
            "O arquivo foi baixado, mas o compartilhamento não está disponível.",
          );
        }
      } else if (result && result.status === 403) {
        Alert.alert(
          "Aviso",
          "Esta SAT ainda não possui permissão para download ou não está finalizada.",
        );
      } else {
        // Adicione isso para ver o código de erro real (ex: 500, 404, 401)
        Alert.alert(
          "Erro",
          `Não foi possível baixar o arquivo. Status: ${result?.status}`,
        );
        console.log("Resultado completo do download:", result);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      Alert.alert(
        "Erro",
        "Ocorreu uma falha ao processar o download do relatório.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadOrder(), checkPermissions()]);
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadInitialData();
    }
  }, [id]); // Now include loadOrder in dependencies

  // Handle refresh
  const handleRefresh = () => {
    loadOrder(true);
  };

  const handleReopen = async () => {
    try {
      const response = await api.put(`/sat/orders/${id}/reopen`);
      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message);
        loadOrder();
      } else {
        Alert.alert("Erro", response.data.message || "Falha ao reabrir a SAT");
      }
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível reabrir a SAT");
      console.error("Error re-opening SAT:", error);
    }
  };

  const handleDelete = async () => {
    // Abrir o alerta de confirmação antes de qualquer lógica
    Alert.alert(
      "Confirmar Exclusão",
      "Após deletada, todas as informações da sat serão perdidas, tem certeza que deseja prosseguir?",
      [
        // Botão para cancelar
        {
          text: "Cancelar",
          style: "cancel",
        },
        // Botão para confirmar a exclusão
        {
          text: "Excluir",
          style: "destructive", // No iOS fica vermelho
          onPress: async () => {
            try {
              // Note que mudei de .put para .delete para seguir o padrão REST do seu Controller destroy
              // Mas se no seu routes/api.php estiver como PUT, mantenha api.put
              const response = await api.delete(`/sat/orders/${id}/delete`);

              if (response.data.success) {
                Alert.alert("Sucesso", response.data.message);
                router.back();
              } else {
                Alert.alert(
                  "Erro",
                  response.data.message || "Falha ao deletar a SAT",
                );
              }
            } catch (error: any) {
              Alert.alert("Erro", "Não foi possível deletar a SAT");
              console.error("Error deleting SAT:", error);
            }
          },
        },
      ],
    );
  };

  const handleEditEquipment = () => {
    setEquipmentText(order?.equipment || "");
    setEquipmentModalVisible(true);
  };

  const handleSaveEquipment = async () => {
    if (!order) return;
    setSavingEq(true);
    try {
      const response = await api.post(
        `/sat/orders/${order.id}/update-equipment`,
        {
          equipment: equipmentText,
        },
      );

      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message);
        setEquipmentModalVisible(false);
        loadOrder(); // Reload data
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Falha ao atualizar equipamento",
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha na conexão ao atualizar equipamento");
    } finally {
      setSavingEq(false);
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => {
    return time.length === 5 ? time : time.substring(0, 5);
  };

  // Format date and time for Brazilian display
  const formatDateTime = (date: string, time: string) => {
    // If date is already in DD/MM/YYYY format from API, use it directly
    let formattedDate = date; // Assuming API returns DD/MM/YYYY

    // If date comes in YYYY-MM-DD format from API, convert to DD/MM/YYYY
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      formattedDate = formatDate(date);
    }

    // Format time to Brazilian format (HH:MM)
    const formattedTime = formatTime(time);

    return `${formattedDate} às ${formattedTime}`;
  };

  const getStatusInfo = (finished: boolean, isEmergency: boolean) => {
    // 1. Emergência e NÃO finalizada
    if (isEmergency && !finished) {
      return {
        text: "Emergencial",
        color: "#FFFFFF", // Texto branco para contraste
        bgColor: "#ff2c07", // Vermelho sólido
      };
    }

    // 2. Emergência e JÁ finalizada
    if (isEmergency && finished) {
      return {
        text: "Emerg. Finalizada",
        color: "#4CAF50", // Verde
        bgColor: "#E8F5E8", // Fundo verde claro
        dotColor: "#ff2c07", // Indicador extra de que foi uma emergência
      };
    }

    // 3. Finalizada Normal
    if (finished) {
      return {
        text: "Finalizada",
        color: "#4CAF50",
        bgColor: "#E8F5E8",
      };
    }

    // 4. Pendente Normal
    return {
      text: "Pendente",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1b0363ff" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ordem não encontrada</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={styles.backButton}
        />
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.finished, order.is_emergency ?? false);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1b0363ff"]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.serviceNumber}>SAT Nº {order.id}</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bgColor },
              ]}
            >
              <Text style={[styles.intervValue, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>

          <View style={styles.headerTop}>
            {!order?.finished && permissions?.sats && (
              <Button
                variant="icon"
                icon={<FontAwesome6 name="pen" size={12} color="#1b0363ff" />}
                title="Editar Equipamento"
                textStyle={styles.reopenBtnText}
                onPress={handleEditEquipment}
                disabled={loading}
              />
            )}

            {!order?.finished &&
              permissions?.sats &&
              order?.notes?.length === 0 && (
                <Button
                  variant="icon"
                  // CORREÇÃO: Usando as props corretamente para garantir alinhamento
                  icon={<FontAwesome6 name="trash-can" size={12} color="red" />}
                  title={loading ? "..." : "Excluir"}
                  textStyle={styles.deleteBtnText}
                  onPress={() => handleDelete()}
                  disabled={loading}
                />
              )}

            {!!order?.finished && (
              <Button
                variant="icon"
                icon={
                  downloading ? (
                    <ActivityIndicator size={12} color="#1b0363ff" />
                  ) : (
                    <FontAwesome6 name="download" size={12} color="#1b0363ff" />
                  )
                }
                title={downloading ? "Gerando..." : "Download"}
                textStyle={styles.reopenBtnText}
                onPress={() => handleDownload()}
                disabled={loading}
              />
            )}

            {!!order?.finished && permissions?.reopen_sat && (
              <Button
                variant="icon"
                // CORREÇÃO: Usando as props corretamente para garantir alinhamento
                icon={
                  <FontAwesome6
                    name="arrows-rotate"
                    size={12}
                    color="#1b0363ff"
                  />
                }
                title={loading ? "..." : "Reabrir"}
                textStyle={styles.reopenBtnText}
                onPress={() => handleReopen()}
                disabled={loading}
              />
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cliente:</Text>
            <Text style={styles.detailValue}>{order.client.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo:</Text>
            <Text style={styles.detailValue}>{order.type.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Setor:</Text>
            <Text style={styles.detailValue}>{order.sector}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Solicitante:</Text>
            <Text style={styles.detailValue}>{order.req_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data e Hora:</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(order.req_date, order.req_time)}
            </Text>
          </View>

          {order.equipment && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Equipamento:</Text>
              <Text style={styles.detailValue}>{order.equipment}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.subtitle}>Descrição:</Text>
          </View>

          <Text style={styles.description}>{order.req_descr}</Text>
        </View>

        {/* Notes Section */}

        {order.notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Atendimento</Text>
            {order.notes.map((note, index) => (
              <View key={index}>
                <View style={styles.intervRow}>
                  <Text style={styles.intervLabel}>
                    Intervenção {index + 1} de {order.notes.length}
                  </Text>
                  <Text style={styles.intervValue}>
                    {formatDate(note.date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.subtitle}>Serviços Realizados:</Text>
                </View>

                <Text style={styles.description}>{note.services}</Text>
                {note.materials?.length > 0 ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.subtitle}>Materiais utilizados:</Text>
                    </View>

                    {note.materials.map((material, index) => (
                      <View key={index} style={styles.materialsRow}>
                        <Text style={styles.materialLabel}>
                          {material.description}
                        </Text>
                        <Text style={styles.materialValue}>
                          {material.pivot.quantity} {material.unit}
                        </Text>
                      </View>
                    ))}
                  </>
                ) : null}
                <View
                  style={[
                    styles.details,
                    index === order.notes.length - 1 && styles.noBorder, // Remove border for last item
                  ]}
                >
                  {note.tecs && (
                    <>
                      <View style={styles.materialsRow}>
                        <Text style={styles.materialLabel}>Horário:</Text>
                        <Text style={styles.materialValue}>
                          Início: {formatTime(note.start)}h - Fim:{" "}
                          {formatTime(note.end)}h
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.subtitle}>Executante(s):</Text>
                      </View>
                      {note.tecs.map((tecn, index) => (
                        <View key={index}>
                          <View style={styles.materialsRow}>
                            <Text style={styles.materialLabel}>Nome:</Text>
                            <Text style={styles.materialValue}>
                              {tecn.user.name} {tecn.user.surname}
                            </Text>
                          </View>

                          <View style={styles.materialsRow}>
                            <Text style={styles.materialLabel}>Função:</Text>
                            <Text style={styles.materialValue}>
                              {tecn.user.function}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL DE EDIÇÃO DE EQUIPAMENTO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={equipmentModalVisible}
        onRequestClose={() => setEquipmentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { maxHeight: "auto" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Equipamento</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEquipmentModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                value={equipmentText}
                onChangeText={setEquipmentText}
                placeholder="Descrição do equipamento"
                maxLength={70}
                label="Descrição"
                multiline={true}
              />
              <Button
                title={savingEq ? "Salvando..." : "Salvar"}
                onPress={handleSaveEquipment}
                disabled={savingEq}
                style={{ marginTop: 10 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    minWidth: 120,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  serviceNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    verticalAlign: "middle",
    height: 34,
  },
  intervValue: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  section: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    flex: 1,
  },

  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },

  bottomNav: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
  },
  intervRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
    paddingVertical: 4,
    color: "#333",
  },
  intervLabel: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1ceceff",
    paddingTop: 12,
    marginBottom: 12,
  },
  noBorder: {
    borderBottomWidth: 0, // Remove border
  },

  materialsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  materialLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
    flex: 1,
  },
  materialValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },
  reopenBtnText: {
    color: "#1b0363ff",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBtnText: {
    color: "red",
    fontSize: 14,
    fontWeight: "700",
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#6b7280",
    lineHeight: 28,
  },
});

export default OrderDetailScreen;
