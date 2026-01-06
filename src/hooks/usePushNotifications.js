// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import pushTokenManager from "../services/pushTokenManager";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export function usePushNotifications() {
  useEffect(() => {
    const initializePushNotifications = async () => {
      if (Platform.OS === "android") {
        // 1. Canal Padrão (Som do sistema)
        await Notifications.setNotificationChannelAsync("default", {
          name: "Notificações Padrão",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default', // Som padrão do sistema
        });

        // 2. Canal de Emergência (Som customizado)
        await Notifications.setNotificationChannelAsync("emergency", {
          name: "Alertas de Emergência",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: "#FF0000",
          sound: 'notificationsound.wav', // Seu arquivo na pasta assets
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        await pushTokenManager.registerPushToken();
      }
    };

    initializePushNotifications();
  }, []);

  // 3. Configurar como o App deve se comportar com a notificação recebida (Foreground)
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const isEmergency = notification.request.content.data.type === "emergency";
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        // No Android, isso dirá ao sistema qual canal usar se o app estiver aberto
        priority: isEmergency ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.DEFAULT,
      };
    },
  });
}