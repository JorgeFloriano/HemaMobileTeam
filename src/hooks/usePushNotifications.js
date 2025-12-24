// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import pushTokenManager from "../services/pushTokenManager";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export function usePushNotifications() {
  useEffect(() => {
    // Registra token push quando o app inicia
    const initializePushNotifications = async () => {
      console.log("🚀 Inicializando notificações push...");
      
      // Configurar canal Android (opcional)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Alert Channel",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: 'notificationsound.wav',
        });
      }
      
      // Solicitar permissões
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === "granted") {
        // Registrar token (uma única vez)
        await pushTokenManager.registerPushToken();
      } else {
        console.warn("⚠️ Permissão para notificações negada");
      }
    };
    
    initializePushNotifications();
  }, []);
}