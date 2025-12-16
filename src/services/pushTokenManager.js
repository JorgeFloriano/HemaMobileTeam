// src/services/pushTokenManager.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import api from "./api"; // Sua instância axios já configurada
import Constants from "expo-constants";

const TOKEN_STORAGE_KEY = "@expo_push_token";
const TOKEN_SENT_KEY = "@expo_token_sent";

class PushTokenManager {
  /**
   * Registra ou atualiza o token push
   * Chame esta função UMA VEZ quando o app iniciar
   */
  async registerPushToken() {
    try {
      console.log("📱 Iniciando registro de token push...");
      
      // 1. Obter token atual do Expo
      const projectId = this.getProjectId();
      if (!projectId) {
        console.warn("⚠️ Project ID não encontrado");
        return null;
      }
      
      const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("✅ Token Expo obtido:", expoToken);
      
      // 2. Verificar se já temos um token salvo
      const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const tokenAlreadySent = await AsyncStorage.getItem(TOKEN_SENT_KEY);
      
      // 3. Se não tem token salvo OU token mudou, enviar para backend
      if (!savedToken || savedToken !== expoToken || !tokenAlreadySent) {
        console.log("🔄 Enviando token para backend...");
        
        await this.sendTokenToBackend(expoToken);
        
        // Salvar localmente
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, expoToken);
        await AsyncStorage.setItem(TOKEN_SENT_KEY, "true");
        
        console.log("✅ Token registrado/atualizado no backend");
      } else {
        console.log("✅ Token já sincronizado com backend");
      }
      
      return expoToken;
    } catch (error) {
      console.error("❌ Erro ao registrar token push:", error);
      return null;
    }
  }
  
  /**
   * Envia token para o backend Laravel
   */
  async sendTokenToBackend(expoToken) {
    try {
      const response = await api.post("/expo-tokens/register", {
        expo_push_token: expoToken,
      });
      
      console.log("✅ Token salvo no backend:", response.data);
      return response.data;
    } catch (error) {
      // Se der erro 422 (token já existe), não é problema
      if (error.response?.status === 422) {
        console.log("ℹ️ Token já existe no backend");
        return;
      }
      
      console.error("❌ Erro ao enviar token:", error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Associa token ao usuário após login
   * Chame esta função quando usuário fizer login
   */
  async associateTokenWithUser() {
    try {
      const expoToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (!expoToken) {
        console.log("ℹ️ Nenhum token push para associar");
        return;
      }
      
      // O backend já sabe qual usuário pelo token JWT
      // Esta chamada apenas atualiza o user_id no registro do token
      const response = await api.post("/expo-tokens/associate", {
        expo_push_token: expoToken,
      });
      
      console.log("✅ Token associado ao usuário:", response.data);
    } catch (error) {
      console.error("❌ Erro ao associar token:", error);
    }
  }
  
  /**
   * Remove token local (chame no logout se quiser)
   */
  async removeLocalToken() {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_SENT_KEY);
    console.log("✅ Tokens push removidos localmente");
  }
  
  /**
   * Obtém Project ID do Expo
   */
  getProjectId() {
    try {
      // Se estiver usando EAS
      const easProjectId = Constants?.expoConfig?.extra?.eas?.projectId || 
                          Constants?.easConfig?.projectId;
      
      if (easProjectId) return easProjectId;
      
      // Fallback para development
      return Constants?.expoConfig?.extra?.projectId || "default";
    } catch {
      return "default";
    }
  }
}

// Exporta uma única instância
export default new PushTokenManager();