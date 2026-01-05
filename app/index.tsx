// app/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useSessionStore } from "@/src/store/useSessionStore";
import api from "@/src/services/api"; // seu serviço axios

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCheckingEmergency, setIsCheckingEmergency] = useState(true);
  const setEmergencyOrderId = useSessionStore(
    (state) => state.setEmergencyOrderId
  );
  const router = useRouter();

  useEffect(() => {
    const checkNavigation = async () => {
      // Se ainda está carregando o auth, não faz nada
      if (authLoading) return;

      // Se não tem usuário, manda para o login
      if (!user || !user.id) {
        router.replace("/login");
        return;
      }

      if (user.tecId !== null) {
        try {
          // SOLICITAÇÃO DINÂMICA: Verifica o banco no momento exato
          const response = await api.get("/technician/check-emergency");
          const { emergency_order_id, emergency_notification_pending } =
            response.data;

          if (emergency_order_id && emergency_notification_pending) {
            // Atualiza o estado global para o ícone ficar vermelho
            setEmergencyOrderId(String(emergency_order_id));

            // Vai direto para a ordem crítica
            router.replace(
              `/order-notes/${emergency_order_id}/order-notes-create`
            );
          } else {
            // Sem emergência ativa, vai para a home
            router.replace("/order-notes");
          }
        } catch (error) {
          console.error("Erro ao verificar emergência:", error);
          router.replace("/order-notes"); // Em caso de erro, segue fluxo normal
        } finally {
          setIsCheckingEmergency(false);
        }
      } else if (user.supId !== null) {
        router.replace("/order-sat");
      } else {
        router.replace("/login");
      }
    };

    checkNavigation();
  }, [user, authLoading]);

  // Exibe o carregamento enquanto checa a autenticação OU a emergência no banco
  if (authLoading || isCheckingEmergency) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#1b0363ff" />
      </View>
    );
  }

  return null;
}
