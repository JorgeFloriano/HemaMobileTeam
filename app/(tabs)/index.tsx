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
import OrderCard from "@/src/components/OrderCard"; // We'll create this component
import Button from "@/src/components/Button";
import { useAuth } from "@/src/contexts/AuthContext";

// Types
export interface Order {
  id: string;
  order_type_id: string;
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
}

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Load orders
  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const response = await api.get<OrdersResponse>("/orders");
      setOrders(response.data.orders);
    } catch (err) {
      const errorMessage = "Failed to load orders";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
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

  // Navigate to create order
  const handleCreateOrder = () => {
    if (Boolean(user?.canCreateSat) !== true) {
      Alert.alert(
        "Acesso negado",
        "Sem permissão para criar solicitações de serviço."
      );
      return;
    }
    router.push("/(tabs)/orders/order-create");
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={() => handleOrderPress(item)} />
  );

  // Handle order press
  const handleOrderPress = (order: Order) => {
    //If user.canSeeSat navigate to order details
    if (user?.canSeeSat) {
      router.push(`/orders/${order.id}`);
    } else {
      Alert.alert(
        "Acesso negado",
        "Sem permissão para visualizar os detalhes da solicitação de serviço."
      );
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No orders found</Text>
      <Button
        title="Create First Order"
        onPress={handleCreateOrder}
        variant="primary"
        style={styles.emptyStateButton}
      />
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
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error && !loading) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Text style={styles.welcome}>Solicitações</Text>
          {Boolean(user?.canCreateSat) === true && (
            <Button
              onPress={handleCreateOrder}
              title="Criar"
              variant="primary"
            />
          )}
        </View>
        <Text style={styles.subtitle}>
          Gerenciamento de Solicitações de Serviço (SAT)
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
