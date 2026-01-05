// context/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { router } from "expo-router";
import { useSessionStore } from "@/src/store/useSessionStore";
import { EventSubscription } from "expo-modules-core";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  // Pegamos a função de disparar o ID para a "sessão"
  const setEmergencyOrderId = useSessionStore(
    (state) => state.setEmergencyOrderId
  );

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        // Garante que o token seja string ou null antes de salvar
        setExpoPushToken(token ?? null);
      })
      .catch((err: Error) => {
        // Salva o objeto de erro no estado de erro, não no token
        setError(err);
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "🔔 Notification Received: ",
          notification.request.content.data
        );
        setNotification(notification);

        // EXTRAÇÃO DO ID: Quando a notificação chegar com o app aberto
        const orderId = notification.request.content.data?.SAT;
        const type = notification.request.content.data.type;
        if (orderId && type === "emergency") {
          setEmergencyOrderId(String(orderId));
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response.notification.request, null, 2)
        );
        const type = response.notification.request.content.data.type;
        const order_id = response.notification.request.content.data.SAT;
        if (type === "emergency") {
          router.push(`/order-notes/${order_id}/order-notes-create`);
        }
        
        // Handle the notification response here
        // ...
        // EXTRAÇÃO DO ID: Quando a notificação chegar com o app em segundo plano
        const orderId = response.notification.request.content.data.SAT;
        
        if (orderId && type === "emergency") {
          setEmergencyOrderId(String(orderId));
        }
      });
    return () => {
      // A forma correta de remover nas versões atuais do Expo
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
