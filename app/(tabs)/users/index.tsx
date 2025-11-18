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
import UserCard from "@/src/components/UserCard";
import Button from "@/src/components/Button";

export interface User {
  id: string;
  name: string;
  surname?: string;
  username: string;
  function?: string;
}

interface UsersResponse {
  users: User[];
  success: boolean;
  error?: string;
  message?: string;
  data?: User[];
}

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load users
  const loadUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const response = await api.get<UsersResponse>("/users");

      // Check if response has success flag
      if (response.data.success === false) {
        throw new Error(
          response.data.error || response.data.message || "Falha ao carregar usuários"
        );
      }

      setUsers(response.data.users || response.data.data || []);
    } catch (err: any) {
      console.error("Error loading orders:", err);

      // Get detailed error message
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Falha ao carregar usuários";

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
    setDeletingUserId(user.id);

    try {
      const response = await api.delete(`/users/${user.id}`);

      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Falha ao excluir usuário"
        );
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);

      if (error.response?.status === 404) {
        Alert.alert("Erro", "Usuário não encontrado");
      } else if (error.response?.status === 422) {
        Alert.alert("Erro", error.response.data.message);
      } else if (error.response?.data?.message) {
        Alert.alert("Erro", error.response.data.message);
      } else {
        Alert.alert("Erro", "Falha ao excluir usuário");
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    loadUsers(true);
  };

  // Navigate to create user
  const handleCreateUser = () => {
    router.push("/(tabs)/users/user-create");
  };

  // Pass deleting state to UserCard
  const renderUserItem = ({ item }: { item: User }) => (
    <UserCard
      user={item}
      onDelete={handleDeleteUser}
      isDeleting={deletingUserId === item.id}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Usuários não encontrados</Text>
      <Button
        title="Create First User"
        onPress={handleCreateUser}
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
        onPress={() => loadUsers()}
        variant="primary"
        style={styles.errorStateButton}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
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
          <Text style={styles.welcome}>Usuários</Text>
          <Button onPress={handleCreateUser} title="Cadastrar" variant="primary" />
        </View>
        <Text style={styles.subtitle}>Gerenciamento de Usuários</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
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
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  header: {
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 16,
  },
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

export default UsersScreen;
