// app/_layout.tsx
import { Stack, usePathname, useRouter } from "expo-router";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { useEffect } from "react";
import { NotificationProvider } from "@/context/NotificationContext";
import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/src/hooks/usePushNotifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

//console.log("Token salvo:", await AsyncStorage.getItem("@expo_push_token"));

function RootLayoutContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  usePushNotifications();

  // FIXED: Proper authentication check
  useEffect(() => {
    if (!isLoading) {
      const isAuthenticated = user?.id;
      if (!isAuthenticated && !pathname.includes("/login")) {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1b0363ff" />
      </View>
    );
  }

  const isAuthenticated = user?.id;

  return (
    <>
      <StatusBar
        barStyle={isAuthenticated ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </NotificationProvider>
  );
}
