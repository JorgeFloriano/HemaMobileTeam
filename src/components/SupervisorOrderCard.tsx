// src/components/SupervisorOrderCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Order } from "@/app/(tabs)/order-notes";
import { FontAwesome } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "@/src/components/Button";

interface SupervisorOrderCardProps {
  order: Order;
  onPress: () => void;
  allTecs: any[]; // Lista de técnicos disponíveis para o supervisor escolher
  onUpdateTec: (
    orderId: number | string,
    tecId: number | string,
  ) => Promise<void>;
  canUpdateTec: boolean;
}

const SupervisorOrderCard: React.FC<SupervisorOrderCardProps> = ({
  order,
  onPress,
  allTecs,
  onUpdateTec,
  canUpdateTec,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedId = order.tec?.id;

  const handleSelectTec = async (tecId: number | string) => {
    setLoading(true);
    try {
      await onUpdateTec(order.id, tecId);
    } catch (error) {
      console.error("Error updating technician:", error);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const getStatusColor = (finished: boolean) => {
    if (finished) return "#4CAF50";
    return "#FF9800"; // Laranja
  };

  const getStatusText = (finished: boolean) => {
    if (finished) return "F";
    return "P";
  };

  // ... restante das suas funções formatDate e formatDateTime
  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
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
    const formattedTime = time.length === 5 ? time : time.substring(0, 5);

    return `${formattedDate} às ${formattedTime}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.clientName} numberOfLines={1}>
          {order.id} - {order.client.name}
        </Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.finished) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(order.finished)}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {order.req_descr}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo de serviço:</Text>
          <Text style={styles.detailValue}>
            {order.type.description ?? "Não informado"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Setor:</Text>
          <Text style={styles.detailValue}>
            {order.sector ?? "Não informado"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data:</Text>
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
        {/* ÁREA DO TÉCNICO - COM FUNÇÃO DE ALTERAR */}
        <View style={styles.tecActionRow}>
          <View>
            <Text style={styles.detailLabel}>Técnico Responsável:</Text>
            <Text style={styles.detailValue}>
              [{order.tec?.id ?? "0"}] -{" "}
              {order.tec?.user?.name ?? "Não atribuído"}{" "}
              {order.tec?.user?.surname ?? ""}
            </Text>
          </View>

          {/* BOTÃO DE ALTERAR TÉCNICO */}
          {!order.finished && canUpdateTec ? (
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
              title={loading ? "..." : "Alterar"}
              textStyle={styles.changeBtnText}
              onPress={() => setModalVisible(true)}
              disabled={loading}
            />
          ) : (
            //LABEL CASO A SAT TENHA SIDO FINALIZADA
            <Text style={styles.detailValue}>
              {order.finished ? (
                "FINALIZADA"
              ) : (
                <MaterialIcons name="block-flipped" size={24} color="red" />
              )}
            </Text>
          )}
        </View>
      </View>

      {/* MODAL COM O NOVO VISUAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atribuir Técnico</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {allTecs.map((tec) => (
                <TouchableOpacity
                  key={tec.id}
                  style={[
                    styles.modalItem,
                    selectedId === tec.id && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectTec(tec.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedId === tec.id && styles.modalItemTextSelected,
                      ]}
                    >
                      {tec.id} - {tec.user.name} {tec.user.surname}
                    </Text>
                  </View>

                  {selectedId === tec.id && (
                    <FontAwesome name="check" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },
  tecActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  changeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1b0363ff",
    borderRadius: 10,
  },
  changeBtnText: {
    color: "#1b0363ff",
    fontSize: 14,
    fontWeight: "700",
  },
  tecItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tecItemName: { fontSize: 16, color: "#333" },
  tecItemId: { fontSize: 14, color: "#999" },
  closeBtn: {
    marginTop: 15,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  closeBtnText: { color: "#666", fontWeight: "bold" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clientName: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: "600", color: "white" },
  description: { fontSize: 14, color: "#666", marginBottom: 12 },
  details: { borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 12 },

  // Estilos do Seletor dentro do Card
  tecSelectionGroup: { marginTop: 4 },
  detailLabel: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
    marginBottom: 6,
  },
  selectButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: { fontSize: 14, color: "#333", fontWeight: "500" },

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
    maxHeight: "100%",
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
  closeButton: { padding: 4 },
  closeButtonText: { fontSize: 28, color: "#6b7280", lineHeight: 28 },
  modalList: { maxHeight: 700 },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemSelected: { backgroundColor: "#1b0363ff" },
  modalItemText: { fontSize: 16, color: "#333" },
  modalItemTextSelected: { color: "white" },
});

export default SupervisorOrderCard;
