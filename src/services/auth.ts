// src/services/auth.ts
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("Attempting login with:", {
        username: credentials.username,
        // Don't log password for security
      });

      const response = await api.post("/auth/login_team", credentials);

      // Validate response structure
      if (!response.data.token || !response.data.user) {
        throw new Error("Invalid response format from server");
      }

      console.log("✅ Login successful");
      console.log("Login response:", {
        status: response.status,
        hasToken: !!response.data.token,
        user: response.data.user,
      });

      return response.data;
    } catch (error: any) {
      console.error("Login service error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      // Specific error handling
      if (error.code === "NETWORK_ERROR") {
        throw new Error("Connection failed. Check your internet.");
      }
      if (error.response?.status === 502) {
        throw new Error("Server is temporarily unavailable.");
      }

      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log("Logging out...");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.multiRemove(["user_token", "user_data"]);
      delete api.defaults.headers.Authorization;
      console.log("Logout completed");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      // 1. Faz a chamada para a rota que já existe
      const response = await api.get("/auth/user");

      // 2. Pega o token atual para não perdê-lo ao salvar os novos dados
      const token = await this.getToken();

      if (response.data && token) {
        // 3. Atualiza o storage local com os dados frescos do servidor
        // Isso garante que os IDs e o onCallPermission estejam atualizados
        await this.storeAuthData(token, response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao sincronizar usuário no service:", error);
      throw error;
    }
  },

  async storeAuthData(token: string, user: any): Promise<void> {
    try {
      console.log("Storing auth data:", {
        tokenLength: token.length,
        user: user.name,
      });
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      console.log("Auth data stored successfully");
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("authToken");
    const isAuth = !!token;
    console.log("isAuthenticated check:", { hasToken: isAuth });
    return isAuth;
  },

  async getToken(): Promise<string | null> {
    const token = await AsyncStorage.getItem("authToken");
    console.log("getToken:", { tokenExists: !!token });
    return token;
  },

  async getUserData(): Promise<any> {
    const userData = await AsyncStorage.getItem("userData");
    const parsedData = userData ? JSON.parse(userData) : null;
    console.log("getUserData:", { userExists: !!parsedData });
    return parsedData;
  },
};
