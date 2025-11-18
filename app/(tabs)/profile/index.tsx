import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, Text, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import api from "@/src/services/api";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";
import KeyboardAvoidingContainer from "@/src/components/KeyboardAvoidingContainer";
import { useAuth } from "@/src/contexts/AuthContext";
import PasswordInput from "@/src/components/PasswordInput";

// Add User type definition
interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  username: string;
  function?: string;
}

const ProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user: authUser } = useAuth(); // ✅ Renamed to avoid conflict
  const [userData, setUserData] = useState<User | null>(null); // ✅ Renamed state

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    function: "",
  });

  // Load current user data
  // Load current user data
  const loadUser = useCallback(async () => {
    try {
      const response = await api.get(`/users/${authUser?.id}/edit`);

      // Check if the API response indicates failure
      if (response.data.success === false) {
        throw new Error(
          response.data.error ||
            response.data.message ||
            "Falha ao carregar usuário"
        );
      }

      const userData = response.data.user || response.data.data;

      if (!userData) {
        throw new Error("Dados do usuário não encontrados na resposta");
      }

      setUserData(userData);

      setFormData({
        name: userData.name || "",
        surname: userData.surname || "",
        email: userData.email || "",
        username: userData.username || "",
        password: "",
        password_confirmation: "",
        function: userData.function || "",
      });
    } catch (error: any) {
      console.error("Error loading user:", error);

      let errorMessage = "Falha ao carregar usuário";

      // Handle different error scenarios
      if (error.response?.status === 404) {
        // 404 errors from your API
        errorMessage = error.response?.data?.error || "Usuário não encontrado";
      } else if (error.response?.data?.error) {
        // Other API errors with error field
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // API errors with message field
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Error thrown from our code
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
    }
  }, [authUser?.id]);
  // Load user data when component mounts
  useEffect(() => {
    if (authUser?.id) {
      loadUser();
    }
  }, [authUser?.id, loadUser]);

  const validateForm = () => {
    if (!formData.name) return "Por favor insira o nome do usuário";
    if (!formData.email)
      return "Por favor insira um e-mail válido para o usuário";
    if (!formData.username) return "Por favor insira um nome de usuário";
    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    )
      return "A senha e a confirmação da senha devem ser iguais";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Erro", error);
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Remove password fields if empty (to keep current password)
      const submitData = { ...formData } as { password?: string };
      if (!submitData.password) {
        delete (submitData as any).password;
        delete (submitData as any).password_confirmation;
      }

      // Update current user's profile - use authUser
      const response = await api.put(`/users/${authUser?.id}`, submitData);

      if (response.data.success) {
        Alert.alert("Sucesso", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.push("/(tabs)"); // Go back to users list
            },
          },
        ]);
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Falha ao atualizar perfil"
        );
      }
    } catch (error: any) {
      console.error("Error updating user:", error);

      // Handle validation errors from Laravel
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        Alert.alert("Erro", firstError[0]);
      } else {
        Alert.alert(
          "Erro",
          error.response?.data?.message || "Falha ao atualizar perfil"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (userData) {
      // ✅ Use userData instead of user
      setFormData({
        name: userData.name || "",
        surname: userData.surname || "",
        email: userData.email || "",
        username: userData.username || "",
        password: "",
        password_confirmation: "",
        function: userData.function || "",
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check both authUser and userData
  if (!authUser || !userData) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingContainer>
      <View style={styles.form}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Editar Perfil</Text>
          <Button
            title={loading ? "Salvando..." : "Salvar"}
            onPress={handleSubmit}
            variant="primary"
            disabled={loading}
          />
        </View>

        <TextInput
          label="Nome *"
          value={formData.name}
          onChangeText={(text) => updateFormData("name", text)}
          placeholder="Seu nome"
          maxLength={20}
          type="text"
        />
        <TextInput
          label="Sobrenome"
          value={formData.surname}
          onChangeText={(text) => updateFormData("surname", text)}
          placeholder="Seu sobrenome"
          maxLength={20}
          type="text"
        />
        <TextInput
          label="Email *"
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
          placeholder="Seu email"
          maxLength={50}
          type="email"
        />
        <TextInput
          label="Usuário *"
          value={formData.username}
          onChangeText={(text) => updateFormData("username", text)}
          placeholder="Seu nome de usuário"
          maxLength={20}
          type="text"
        />
        <TextInput
          label="Função"
          value={formData.function}
          onChangeText={(text) => updateFormData("function", text)}
          placeholder="Sua função"
          maxLength={20}
          type="text"
        />
        <PasswordInput
          label="Nova Senha (deixe vazio para manter a atual)"
          value={formData.password}
          onChangeText={(text) => updateFormData("password", text)}
          placeholder="Nova senha"
          maxLength={20}
          showPasswordToggle={true}
        />
        <PasswordInput
          label="Confirmar Nova Senha"
          value={formData.password_confirmation}
          onChangeText={(text) => updateFormData("password_confirmation", text)}
          placeholder="Confirmar nova senha"
          maxLength={20}
          showPasswordToggle={true}
        />
      </View>
    </KeyboardAvoidingContainer>
  );
};

// ... your styles remain the same
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  form: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
});

export default ProfileScreen;
