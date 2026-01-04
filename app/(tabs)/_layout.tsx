// app/(tabs)/_layout.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import { Stack } from "expo-router";
import TopNavigationBar from "@/src/components/TopNavigationBar";
import BottomTabBar from "@/src/components/BottomTabBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Simple keyboard listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Top Navigation Bar */}
        <TopNavigationBar />

        {/* Main Content */}
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="order-notes/index" />
            <Stack.Screen name="order-sat/index" />
            <Stack.Screen name="profile/index" />
            <Stack.Screen name="users/index" />
          </Stack>
        </View>

        {/* Bottom Tab Bar - Hidden when keyboard is open */}
        {!isKeyboardVisible && <BottomTabBar />}
        
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  content: {
    flex: 1,
  },
});