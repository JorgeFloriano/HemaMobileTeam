import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/src/services/api";
import Button from "@/src/components/Button";
import { Order } from "@/app/(tabs)/order-notes";

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load order details
  const loadOrder = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.get<{ order: Order }>(
        `/notes/show/${id}`
      );
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

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]); // Now include loadOrder in dependencies

  // Handle refresh
  const handleRefresh = () => {
    loadOrder(true);
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

  // Get status display
  const getStatusInfo = (finished: boolean) => {
    return {
      text: finished ? "Finalizada" : "Pendente",
      color: finished ? "#4CAF50" : "#FF9800",
      bgColor: finished ? "#E8F5E8" : "#FFF3E0",
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

  const statusInfo = getStatusInfo(order.finished);

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
                {note.materials.length > 0 ? (
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
});

export default OrderDetailScreen;
