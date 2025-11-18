import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import api from "@/src/services/api";
import TextInput from "@/src/components/TextInput";
import PasswordInput from "@/src/components/PasswordInput";
import CheckboxInput from "@/src/components/CheckboxInput";
import Button from "@/src/components/Button";
import KeyboardAvoindingContainer from "@/src/components/KeyboardAvoidingContainer";

// Types
interface UserFormData {
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  function: string;
  can_create_sat: boolean;
  can_see_sat: boolean;
}

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Constants
const FORM_LABELS = {
  title: "Cadastrar Usuário",
  save: "Salvar",
  saving: "Salvando...",
  success: "Sucesso",
  error: "Erro",
  accessDenied: "Acesso Negado",
} as const;

const CreateUserScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    function: "",
    can_create_sat: false,
    can_see_sat: false,
  });

  // Permission check
  const checkCreatePermission = useCallback(async () => {
    try {
      setPermissionLoading(true);
      const response = await api.get<ApiResponse>("/users/create");

      if (response.data.error) {
        showAlert(FORM_LABELS.accessDenied, response.data.error);
        router.back();
        return;
      }

      if (response.data.success) {
        setHasPermission(true);
      } else {
        showAlert(
          FORM_LABELS.accessDenied,
          response.data.message || "Sem permissão para criar usuários"
        );
        router.back();
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(
        err,
        "Falha ao verificar permissões"
      );
      showAlert(FORM_LABELS.error, errorMessage);
      router.back();
    } finally {
      setPermissionLoading(false);
    }
  }, [router]);

  // Effects
  useEffect(() => {
    checkCreatePermission();
  }, [checkCreatePermission]);

  // Utility functions
  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const getErrorMessage = (error: any, defaultMessage: string): string => {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      defaultMessage
    );
  };

  // Form validation
  const validateForm = (): string | null => {
    const validations = [
      {
        condition: !formData.name,
        message: "Por favor insira o nome do usuário",
      },
      {
        condition: !formData.email,
        message: "Por favor insira um e-mail válido para o usuário",
      },
      {
        condition: !formData.username,
        message: "Por favor insira um nome de usuário",
      },
      {
        condition: !formData.password,
        message: "Por favor insira uma senha para o usuário",
      },
      {
        condition: !formData.password_confirmation,
        message: "Por favor confirme a senha para o usuário",
      },
      {
        condition: formData.password !== formData.password_confirmation,
        message: "A senha e a confirmação da senha devem ser iguais",
      },
    ];

    const error = validations.find((v) => v.condition);
    return error ? error.message : null;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!hasPermission) {
      showAlert(
        FORM_LABELS.accessDenied,
        "Você não tem permissão para criar usuários"
      );
      return;
    }

    const error = validateForm();
    if (error) {
      showAlert(FORM_LABELS.error, error);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<ApiResponse>("/users", formData);

      if (response.data.success) {
        showAlert(
          FORM_LABELS.success,
          response.data.message || "Usuário criado com sucesso"
        );
        resetForm();
        router.push("/(tabs)/users");
      } else {
        showAlert(
          FORM_LABELS.error,
          response.data.message || "Falha ao criar cadastro de usuário"
        );
      }
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        showAlert(FORM_LABELS.error, firstError[0]);
      } else {
        const errorMessage = getErrorMessage(
          error,
          "Falha ao criar cadastro de usuário"
        );
        showAlert(FORM_LABELS.error, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      surname: "",
      email: "",
      username: "",
      password: "",
      password_confirmation: "",
      function: "",
      can_create_sat: false,
      can_see_sat: false,
    });
  };

  const updateFormData = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text>Acesso negado</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoindingContainer>
      <View style={styles.form}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Cadastrar Usuário</Text>
          <Button
            title={loading ? "Salvando..." : "Salvar"}
            onPress={handleSubmit}
            variant="primary"
            disabled={loading}
          />
        </View>

        <CheckboxInput
          label="Permitir criar solicitação"
          value={formData.can_create_sat}
          onChange={(value) => updateFormData("can_create_sat", value)}
        />

        <CheckboxInput
          label="Permitir visualizar solicitação"
          value={formData.can_see_sat}
          onChange={(value) => updateFormData("can_see_sat", value)}
        />

        <TextInput
          label="Nome *"
          value={formData.name}
          onChangeText={(text) => updateFormData("name", text)}
          placeholder="Nome do Usuário"
          maxLength={20}
          type="text"
        />

        <TextInput
          label="Sobrenome"
          value={formData.surname}
          onChangeText={(text) => updateFormData("surname", text)}
          placeholder="Sobrenome do Usuário"
          maxLength={20}
          type="text"
        />

        <TextInput
          label="Email *"
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
          placeholder="Email"
          maxLength={50}
          type="email"
        />

        <TextInput
          label="Usuário *"
          value={formData.username}
          onChangeText={(text) => updateFormData("username", text)}
          placeholder="Username"
          maxLength={20}
          type="text"
        />

        <TextInput
          label="Função"
          value={formData.function}
          onChangeText={(text) => updateFormData("function", text)}
          placeholder="Função"
          maxLength={20}
          type="text"
        />

        <PasswordInput
          label="Senha *"
          value={formData.password}
          onChangeText={(text) => updateFormData("password", text)}
          placeholder="Senha"
          maxLength={20}
          showPasswordToggle={true}
        />

        <PasswordInput
          label="Confirmar Senha *"
          value={formData.password_confirmation}
          onChangeText={(text) => updateFormData("password_confirmation", text)}
          placeholder="Confirmar Senha"
          maxLength={20}
          showPasswordToggle={true}
        />
      </View>
    </KeyboardAvoindingContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  form: {
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#ffffffff",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  header: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreateUserScreen;
