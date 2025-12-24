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
import OrderCard from "@/src/components/OrderCard";
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
  const [emergencyOrderId, setEmergencyOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const performLogout = async () => {
    await logout();
    router.replace("/login");
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
      const response = await api.get<OrdersResponse>("/technician/orders");
      setOrders(response.data.orders);
      setEmergencyOrderId(response.data.emergency_order_id || null);
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
    loadOrders();
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    loadOrders(true);
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      emergencyOrderId={emergencyOrderId ?? undefined} // Usa o estado da tela
      onPress={() => handleOrderPress(item)}
    />
  );

  // Handle order press
  const handleOrderPress = (order: Order) => {
    // If order is finished, navigate to order details, otherwise navigate to fill form
    if (order.finished) {
      router.push(`/order-notes/${order.id}/order-notes-show`);
    } else {
      router.push(`/order-notes/${order.id}/order-notes-create`);
    }
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
        <ActivityIndicator size="large" color="#007AFF" />
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
        <Text style={styles.welcome}>Programação</Text>
        <Text style={styles.subtitle}>
          Solicitações de Assistência Técnica (SAT)
        </Text>
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
            colors={["#007AFF"]}
            tintColor="#007AFF"
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
