import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Order } from "@/app/(tabs)/orders";

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const getStatusColor = (finished: boolean) => {
    return finished ? "#4CAF50" : "#FF9800";
  };

  const getStatusText = (finished: boolean) => {
    return finished ? "F" : "P";
  };

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
        <Text style={styles.serviceType} numberOfLines={1}>
          {order.id} - {order.type.description}
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
          <Text style={styles.detailLabel}>Setor:</Text>
          <Text style={styles.detailValue}>{order.sector}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data:</Text>
          <Text style={styles.detailValue}>
            {formatDateTime(order.req_date, order.req_time)}
          </Text>
        </View>

        {order.tec && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Técnico:</Text>
            <Text style={styles.detailValue}>
              {order.tec.user.name} {order.tec.user.surname}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
});

export default OrderCard;
