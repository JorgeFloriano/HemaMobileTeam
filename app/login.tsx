// app/login.tsx
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { authService } from "@/src/services/auth";
import { useAuth } from "@/src/contexts/AuthContext";
import TextInput from "@/src/components/TextInput";
import PasswordInput from "@/src/components/PasswordInput";
import pushTokenManager from "@/src/services/pushTokenManager";

import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  Pressable,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import Button from "@/src/components/Button";

// Remove the onLogin prop since we're using AuthContext
const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  //const [username, setUsername] = useState("alexandre.machado");
  const [username, setUsername] = useState("");
  //const [password, setPassword] = useState("science123J@");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Se quiser controlar manualmente:
    // await pushTokenManager.associateTokenWithUser();

    const newErrors: string[] = [];
    // Basic validation
    if (!username.trim()) {
      newErrors.push("O campo usuário é obrigatório");
    }
    if (!password.trim()) {
      newErrors.push("O campo senha é obrigatório");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: username.trim(),
        password: password.trim(),
      });

      // 1. Atualiza o contexto global
      await login(response.token, response.user);

      // 2. Associa o token de push
      pushTokenManager.associateTokenWithUser();

      // 3. Lógica de Redirecionamento usando a 'response.user' diretamente
      const userData: {
        id: string;
        username: string;
        name: string;
        email?: string | undefined;
        tecId?: string | undefined;
        supId?: string | undefined;
      } = response.user;

      if (userData.tecId) {
        // Se for técnico (independente de ser supervisor também)
        router.replace("/(tabs)/order-notes");
      } else if (userData.supId) {
        // Se não for técnico, mas for supervisor
        router.replace("/(tabs)/order-sat");
      } else {
        // Caso não tenha nenhum dos dois (opcional)
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different error types
      if (error.response?.status === 401) {
        setErrors(["Credenciais inválidas"]);
      } else if (error.response?.status === 422) {
        // Validation errors from Laravel
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat() as string[];
        setErrors(errorMessages);
      } else if (error.message === "Network Error") {
        setErrors(["Erro de conexão. Verifique sua internet."]);
      } else {
        setErrors(["Erro no servidor. Tente novamente."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust this value as needed
    >
      <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Important for nested touchables
        >
          <View style={styles.scrollContent}>
            <View style={styles.card}>
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/logo_hema.png")} // Replace with your logo path
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <Text style={styles.title}>Sistema de Gerenciamento</Text>

                <TextInput
                  label="Usuário"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Digite seu nome de usuário"
                  autoCapitalize="none" // Impede a primeira letra maiúscula
                  autoCorrect={false} // Desativa a correção ortográfica (o que você pediu)
                  keyboardType="email-address"
                />

                <PasswordInput
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  showPasswordToggle={true}
                />

                <Button
                  title={isLoading ? "ENTRANDO..." : "ENTRAR"}
                  onPress={handleLogin}
                  variant="primary"
                  disabled={isLoading}
                  style={styles.loginButton}
                />

                {errors.length > 0 && (
                  <View style={styles.errorContainer}>
                    {errors.map((error, index) => (
                      <Text key={index} style={styles.errorText}>
                        • {error}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressableContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 4,
    overflow: "hidden",
  },
  logoContainer: {
    padding: 30,
    backgroundColor: "#1b0363",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  logo: {
    width: "100%",
    height: 80,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    marginBottom: 4,
  },
  debugContainer: {
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  debugText: {
    fontSize: 14,
    color: "#666",
  },
});

export default LoginScreen;
