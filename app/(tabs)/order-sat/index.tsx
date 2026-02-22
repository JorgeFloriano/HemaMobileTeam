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
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/src/services/api";
import SupervisorOrderCard from "@/src/components/SupervisorOrderCard";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import OrdersFilterModal from "@/src/components/OrdersFilterModal";
import SearchInput from "@/src/components/SearchInput";

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

interface FilterState {
  client_id: string | number;
  tec_id: string | number;
  finished: string | number;
  date_start: string;
  date_end: string;
  date_type: "order_open_date" | "last_note_date";
}

// 1. Defina o estado inicial fora ou dentro do componente
const initialFilterState: FilterState = {
  client_id: "",
  tec_id: "",
  finished: "2",
  date_start: "",
  date_end: "",
  date_type: "order_open_date",
};

const hasActiveFilters = (activeFilters: FilterState) => {
  return (
    activeFilters.client_id !== "" ||
    activeFilters.tec_id !== "" ||
    activeFilters.finished !== "2" || // "2" é o padrão (Todas)
    activeFilters.date_start !== "" ||
    activeFilters.date_end !== ""
  );
};

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tecs, setTecs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] =
    useState<FilterState>(initialFilterState);
  const [searchId, setSearchId] = useState("");

  // Adicione estados para as novas permissões que precisar
  const [permissions, setPermissions] = useState({
    attach_tec: false,
    sats: false,
  });

  // Função para fazer logout
  const performLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Navigate to create order
  const handleCreateOrder = () => {
    if (!user?.isSup) {
      Alert.alert(
        "Acesso negado",
        "Sem permissão para criar solicitações de assistência técnica.",
      );
      return router.push("/(tabs)/order-sat");
    }
    router.push("/(tabs)/order-sat/order-create");
  };

  const handleSearch = async () => {
    // Impede busca vazia ou se já estiver carregando
    if (!searchId || refreshing) return;

    try {
      setLoading(true);
      setError(null);

      // Mudança para POST enviando o searchId no corpo (body)
      const response = await api.post<OrdersResponse>("/sat/orders/search", {
        search: searchId, // Corresponde ao 'search' no validated do Laravel
      });

      if (response.data.orders) {
        setOrders(response.data.orders);

        if (response.data.orders.length === 0) {
          Alert.alert("Busca", "Nenhuma SAT encontrada com este número.");
          loadOrders(true);
        } else {
          setSearchId(""); // Limpa o texto do campo de busca
        }
      }
    } catch (err: any) {
      console.error("Erro na busca:", err);

      // Trata erro de validação (ex: número muito grande ou não numérico)
      const msg = err.response?.data?.message || "Erro ao realizar a busca.";
      Alert.alert("Erro de Busca", msg);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar técnicos (allTecs)
  const loadTecs = async () => {
    try {
      const response = await api.get("/tecs/list"); // Ajuste o endpoint conforme seu Laravel
      // Criamos o item "Não atribuído" seguindo a estrutura do seu objeto de técnicos
      const unassignedTec = {
        id: "0",
        user: {
          name: "Não atribuído",
          surname: "",
        },
      };
      setTecs([unassignedTec, ...response.data]);
    } catch (err) {
      console.error("Erro ao carregar técnicos:", err);
    }
  };

  const loadClients = async () => {
    try {
      // Ajuste o endpoint conforme sua API (ex: /emergency/clients ou /clients/list)
      const response = await api.get("/emergency/clients");
      setClients(response.data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  const checkPermissions = async () => {
    try {
      const response = await api.get("/user-permissions", {
        params: {
          // Passando como string separada por vírgula é mais fácil para o Axios
          names: "attach_tec,sats",
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

  // Função para atualizar o técnico da ordem (API Call)
  const handleUpdateOrderTec = async (
    orderId: number | string,
    tecId: number | string,
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
          response.data.message || "Não foi possível completar a ação.",
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
    setSearchId(""); // Limpa o texto do campo de busca
    setLoading(true);
    await Promise.all([
      loadOrders(),
      loadTecs(),
      loadClients(),
      checkPermissions(),
    ]);
    setLoading(false);
  };

  // Load orders
  const loadOrders = async (showRefreshing = false, params = {}) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const response = await api.get<OrdersResponse>("/sat/orders", { params });
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
    loadOrders(true); // Recarrega a lista completa (sem os params de busca)
  };

  // Função para converter data DD/MM/YYYY para YYYY-MM-DD (Laravel format)
  const formatDateForApi = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("/").reverse().join("-");
  };

  const handleApplyFilters = (filters: FilterState) => {
    // 1. Salva os filtros no estado local (com data DD/MM/YYYY para o Modal ler depois)
    setActiveFilters(filters);
    setSearchId(""); // Limpa o texto do campo de busca

    // 2. Cria uma cópia apenas para a requisição com datas formatadas para o Laravel
    const apiParams = {
      ...filters,
      date_start: formatDateForApi(filters.date_start),
      date_end: formatDateForApi(filters.date_end),
    };

    loadOrders(false, apiParams);
    setIsFilterVisible(false);
  };

  // Renderização do Item atualizada
  const renderOrderItem = ({ item }: { item: Order }) => (
    <SupervisorOrderCard
      order={item}
      onPress={() => handleOrderPress(item)}
      onUpdateTec={handleUpdateOrderTec} // Passa a função de API
      allTecs={tecs} // Passa a lista de técnicos carregada
      canUpdateTec={permissions.attach_tec} // Passa a permissão de anexar técnico
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
        <View style={styles.headerTopRow}>
          <Text style={styles.welcome}>SATs</Text>

          <View style={styles.headerButtons}>
            {/* Botão de Busca */}
            <SearchInput
              value={searchId}
              onChangeText={setSearchId}
              onSearch={handleSearch}
              containerStyle={{ width: 150 }}
              loading={loading}
            />

            {/* Botão de Filtro */}
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setIsFilterVisible(true)}
            >
              <FontAwesome name="filter" size={22} color="#1b0363ff" />
              {hasActiveFilters(activeFilters) && (
                <View style={styles.filterBadgeSmall} />
              )}
            </TouchableOpacity>

            {/* Segundo Botão (Ex: Logout ou Outro) */}
            {permissions.sats && (
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => handleCreateOrder()}
              >
                <MaterialCommunityIcons
                  name="file-document-plus-outline"
                  size={24}
                  color="#1b0363ff"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.subtitle}>Solicitações de Assistência Técnica</Text>
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

      <OrdersFilterModal
        visible={isFilterVisible}
        filters={activeFilters} // Passa os filtros atuais
        setFilters={setActiveFilters} // Passa a função para atualizar
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilters}
        onClear={() => {
          setActiveFilters(initialFilterState);
        }}
        clients={clients}
        tecs={tecs}
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
    paddingVertical: 24,
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

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Empurra o título para a esquerda e botões para a direita
    alignItems: "center",
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "white", // Fundo branco para parecer um botão limpo
    justifyContent: "center",
    alignItems: "center",
    color: "#1b0363ff", // Sua cor principal
    borderWidth: 1,
    borderColor: "#1b0363ff",
    // Sombra leve para dar profundidade
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterBadgeSmall: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: "#ff3b30",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default OrdersScreen;
