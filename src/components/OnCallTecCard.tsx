// src/components/OnCallTecCard.tsx
import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface OnCallTecCardProps {
  tec: any;
  onToggleActive: (value: boolean) => void;
  onManageClients: () => void;
  onViewOrder: (orderId: string) => void;
}

const OnCallTecCard: React.FC<OnCallTecCardProps> = ({
  tec,
  onToggleActive,
  onManageClients,
  onViewOrder,
}) => {
  const isBusy = !!tec.emergency_order_id;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{tec.user.name}</Text>
          <Text style={styles.function}>{tec.user.function || "Técnico"}</Text>
        </View>
        <View style={styles.activeSection}>
          {/* Aqui acontece a mágica: se for verdadeiro exibe 'ATIVO', se não 'DESATIVADO' */}
          <Text style={[styles.label]}>
            {tec.on_call ? "DESATIVAR" : "ATIVAR"}
          </Text>

          <Switch
            value={!!tec.on_call}
            onValueChange={onToggleActive}
            trackColor={{ false: "#ef6c00", true: "#4CAF50" }}
            thumbColor={"#1b0363ff"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clientBtn} onPress={onManageClients}>
          <FontAwesome name="users" size={14} color="#1b0363ff" />
          <Text style={styles.clientBtnText}>
            Clientes (
            {tec.emergency_clients_count ?? tec.emergency_clients?.length ?? 0})
          </Text>
        </TouchableOpacity>

        <View style={styles.statusBadge}>
          {isBusy ? (
            <TouchableOpacity
              style={styles.busyBtn}
              onPress={() => onViewOrder(tec.emergency_order_id)}
            >
              <Text style={styles.busyText}>
                ● Ocupado - SAT {tec.emergency_order_id}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.availableText}>● Disponível</Text>
          )}
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
    elevation: 2,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  function: { fontSize: 13, color: "#666", marginTop: 2 },
  activeSection: { alignItems: "center" },
  label: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clientBtn: { flexDirection: "row", alignItems: "center" },
  clientBtnText: {
    marginLeft: 6,
    color: "#1b0363ff",
    fontWeight: "600",
    fontSize: 13,
  },
  availableText: { color: "#4CAF50", fontWeight: "600", fontSize: 13 },
  busyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  busyText: { color: "#ef6c00", fontWeight: "600", fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default OnCallTecCard;
