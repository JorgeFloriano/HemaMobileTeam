// src/components/TopNavigationBar.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface TopNavigationBarProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  onBackPress?: () => void;
}

// Utility function to remove last path segment
const getParentPath = (path: string): string => {
  // Remove the last segment after the last "/"
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex > 0) {
    return path.substring(0, lastSlashIndex);
  }
  return path; // Return original if no slash found
};

// Top Navigation Bar Component
const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  showBack = true,
  onBackPress,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // FIXED: Move logout logic to useEffect
  useEffect(() => {
    if (!user || !user.id) {
      const performLogout = async () => {
        await logout();
        router.replace("/login");
      };
      performLogout();
    }
  }, [user, logout, router]);

  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  const isHomeScreen = () => {
    const homeRoutes = ["/", "/(tabs)", "/order-notes", "/order-sat", "on-call"];
    return homeRoutes.includes(pathname);
  };

  const icon = () => {
    if (isHomeScreen()) {
      return "log-out-outline";
    }
    return "arrow-back-outline";
  };

  const handleButtonPress = () => {
    if (isHomeScreen()) {
      // Show logout confirmation on home screen
      showLogoutConfirmation();
    } else {
      // Handle back navigation for other screens
      if (onBackPress) {
        onBackPress();
      } else {
        const parentPath = getParentPath(pathname);
        if (parentPath !== pathname) {
          try {
            router.back();
          } catch (error) {
            console.error("Error navigating back:", error);
          }

          //router.push(parentPath as any);
        } else {
          router.push("/(tabs)");
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Background */}
      <View style={styles.statusBarBackground} />

      {/* Navigation Content */}
      <View style={styles.content}>
        {/* Logo on the right for balance */}
        <Image
          source={require("@/assets/images/logo2_hema.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome message in center */}
        <View style={styles.titleContainer}>
          {user && (
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
          )}
        </View>
        {/* Back button on the left */}
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleButtonPress}
          >
            <Ionicons name={icon()} size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Logout</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair do aplicativo?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1b0363",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  statusBarBackground: {
    height: Platform.OS === "ios" ? 44 : StatusBar.currentHeight,
    backgroundColor: "#1b0363",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#1b0363ff",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default TopNavigationBar;
