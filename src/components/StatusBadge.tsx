import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatusBadgeProps {
  finished: boolean;
  isEmergency: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ finished, isEmergency }) => {
  
  // Lógica de Estados (Igual ao Laravel)
  let config = {
    bgColor: "#4CAF50", // Verde padrão (Finalizada)
    label: "F",
    showEmergencyDot: false,
  };

  if (isEmergency && !finished) {
    // Caso 1: Emergência Aberta
    config = {
      bgColor: "#ff2c07", // Vermelho
      label: "E",
      showEmergencyDot: false,
    };
  } else if (isEmergency && finished) {
    // Caso 2: Emergência Finalizada
    config = {
      bgColor: "#4CAF50", // Verde
      label: "F",
      showEmergencyDot: true, // Bolinha vermelha no canto
    };
  } else if (!finished) {
    // Caso 3: Pendente Normal
    config = {
      bgColor: "#FF9800", // Laranja
      label: "P",
      showEmergencyDot: false,
    };
  }

  return (
    <View style={styles.container}>
      {/* Círculo Principal */}
      <View style={[styles.circle, { backgroundColor: config.bgColor }]}>
        <Text style={styles.label}>{config.label}</Text>
      </View>

      {/* Bolinha Vermelha (Apenas Emergência + Finalizada) */}
      {config.showEmergencyDot && (
        <View style={styles.emergencyDot} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 24,
    height: 24,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12, // Metade da largura/altura para ser círculo
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emergencyDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff2c07",
    borderWidth: 1.5,
    borderColor: "white", // Borda de contraste igual ao Laravel
  },
});

export default StatusBadge;