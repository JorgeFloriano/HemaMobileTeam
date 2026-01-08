// app/(tabs)/order-sat/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/src/services/api";
import SupervisorOrderCard from "@/src/components/SupervisorOrderCard";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/contexts/AuthContext";

// Types
export interface Order {
  id: string;
  order_type_id: string;
  client: {
    id: string;
    name: string;
  };
  tec_id?: string | null;
  req_descr: string;
  req_name: string;
  sector: string;
  req_date: string;
  req_time: string;
  finished: boolean;
  equipment?: string;
  type: {
    id: string;
    description: string;
  };
  tec: {
    id: string;
    user_id: string;
    user: {
      id: string;
      name: string;
      surname: string;
    };
  } | null;
  notes: {
    id: number;
    date: string;
    start: string;
    end: string;
    services: string;
    tecs: {
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
        function: string;
        surname: string;
      };
    }[];
    created_at: string;
    materials: {
      id: number;
      description: string;
      unit: string;
      pivot: { quantity: number };
    }[];
  }[];
}
interface OrdersResponse {
  orders: Order[];
  emergency_order_id?: string | null;
  error?: string;
  success?: boolean;
  message?: string;
}

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tecs, setTecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  // Função para fazer logout
  const performLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Função para carregar técnicos (allTecs)
  const loadTecs = async () => {
    try {
      const response = await api.get("/tecs/list"); // Ajuste o endpoint conforme seu Laravel
      setTecs(response.data);
    } catch (err) {
      console.error("Erro ao carregar técnicos:", err);
    }
  };

  // Função para atualizar o técnico da ordem (API Call)
  const handleUpdateOrderTec = async (
    orderId: number | string,
    tecId: number | string
  ) => {
    try {
      const response = await api.post(`/sat/orders/${orderId}/update-tec`, {
        tec_id: tecId,
      });

      // Se a API retornou success: true (mesmo que a notificação tenha falhado)
      if (response.data.success) {
        Alert.alert("Atualização", response.data.message);
        loadOrders(true); // Recarrega a lista para mostrar o novo técnico no card
      } else {
        // Caso o backend envie success: false por algum motivo de regra de negócio
        Alert.alert(
          "Aviso",
          response.data.message || "Não foi possível completar a ação."
        );
      }
    } catch (err: any) {
      // Aqui pegamos erros de servidor (404, 403, 500)
      const errorMessage =
        err.response?.data?.message || "Erro de conexão com o servidor.";

      Alert.alert("Erro", errorMessage);

      // Importante: lançar o erro novamente para o SupervisorOrderCard
      // saber que deve parar o estado de "loading" do botão
      throw err;
    }
  };

  // Ajuste no loadOrders para carregar técnicos também
  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadTecs()]);
    setLoading(false);
  };

  // Load orders
  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const response = await api.get<OrdersResponse>("/sat/orders");
      setOrders(response.data.orders);
    } catch (err: any) {
      if (err.response?.data?.error) {
        // Check if response has error
        Alert.alert("Acesso Negado", err.response.data.error);
        performLogout();
        return;
      }
      const errorMessage =
        "Falha ao carregar solicitações de assistência técnica";
      setError(errorMessage);
      Alert.alert("Erro", errorMessage);
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    loadOrders(true);
  };

  // Renderização do Item atualizada
  const renderOrderItem = ({ item }: { item: Order }) => (
    <SupervisorOrderCard
      order={item}
      onPress={() => handleOrderPress(item)}
      onUpdateTec={handleUpdateOrderTec} // Passa a função de API
      allTecs={tecs} // Passa a lista de técnicos carregada
    />
  );

  // Handle order press
  const handleOrderPress = (order: Order) => {
    // Navigate to order details
    router.push(`/order-sat/${order.id}/order-sat-show`);
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Solicitações de assistência técnica não encontradas
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorStateText}>{error}</Text>
      <Button
        title="Try Again"
        onPress={() => loadOrders()}
        variant="primary"
        style={styles.errorStateButton}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1b0363ff" />
        <Text style={styles.loadingText}>Carregando solicitações...</Text>
      </View>
    );
  }

  if (error && !loading) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Solicitações de Assist. Técnica</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1b0363ff"]}
            tintColor="#1b0363ff"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "space-between",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyStateButton: {
    minWidth: 160,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorStateText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  errorStateButton: {
    minWidth: 120,
  },
});

export default OrdersScreen;
