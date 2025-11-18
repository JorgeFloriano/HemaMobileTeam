// app/index.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router"; // Removed unused Redirect import
import { useAuth } from "@/src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.id && user.isClient) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]); // ✅ Added router to dependencies

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1b0363ff" />
      </View>
    );
  }

  return null;
}