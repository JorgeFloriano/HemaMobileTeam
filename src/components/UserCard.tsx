import React from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { User } from "@/app/(tabs)/users";
import Feather from "@expo/vector-icons/Feather";
import Button from "@/src/components/Button";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  isDeleting?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onDelete,
  isDeleting = false,
}) => {
  const router = useRouter();

  const handleEdit = () => {
    // Navigate to edit screen using the dynamic [id].tsx route
    router.push(`/users/${user.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o usuário ${user.name}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            if (onDelete) {
              onDelete(user);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.serviceType} numberOfLines={1}>
          {user.id} - {user.name} {user.surname}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {user.function}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Username: {user.username}</Text>
          <View style={styles.buttonRow}>
            <Button
              title={<Feather name="edit" size={18} color="#1b0363ff" />}
              onPress={handleEdit}
              variant="icon"
              disabled={isDeleting}
            />
            <Button
              title={
                isDeleting ? (
                  <ActivityIndicator size="small" color="#1b0363ff" />
                ) : (
                  <Feather name="trash-2" size={18} color="#1b0363ff" />
                )
              }
              onPress={handleDelete}
              variant="icon"
              disabled={isDeleting}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: "#333",
    fontWeight: "400",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
});

export default UserCard;
