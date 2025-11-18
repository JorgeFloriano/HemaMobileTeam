// src/components/BottomTabBar.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Tab {
  name: string;
  href: string;
  icon: string;
  label: string;
  showForAdmin?: boolean; // Property to control visibility
}

const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const baseTabs: Tab[] = [
  {
    name: "index",
    href: "/",
    icon: "home",
    label: "Home",
  },
  {
    name: "orders",
    href: "/orders",
    icon: "list",
    label: "Ordens",
  },
  {
    name: "user-edit",
    href: "/profile",
    icon: "person",
    label: "Perfil",
  },
  {
    name: "users",
    href: "/users",
    icon: "person-outline",
    label: "Usuários",
    showForAdmin: true, // Only show for admin users
  },
];

  // Filter tabs based on user role
  const tabs = baseTabs.filter(tab => {
    if (tab.showForAdmin) {
      // Only show this tab if user is admin
      // Adjust this condition based on your actual user role property
      return user?.isAdmin;
    }
    return true; // Show all other tabs
  });

  // Find active tab index
  const activeIndex = tabs.findIndex((tab) => {
    if (tab.href === "/" && pathname === "/") return true;
    return pathname.startsWith(tab.href) && tab.href !== "/";
  });

  // Animation value for the blue border - FIXED: Use number instead of index directly
  const borderPosition = useSharedValue(activeIndex);

  // Update border position when active tab changes - FIXED: Proper useEffect
  React.useEffect(() => {
    borderPosition.value = withSpring(activeIndex, {
      stiffness: 2000,
    });
  }, [activeIndex, borderPosition]);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    return pathname.startsWith(href) && href !== "/";
  };

  // FIXED: Better border animation using pixel calculations
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const tabWidth = SCREEN_WIDTH / tabs.length;
    const translateX = interpolate(
      borderPosition.value,
      [0, tabs.length - 1],
      [0, (tabs.length - 1) * tabWidth]
    );

    return {
      transform: [{ translateX }],
      width: tabWidth,
    };
  });

  const TabButton = ({ tab, index }: { tab: Tab; index: number }) => {
    const active = isActive(tab.href);

    const textAnimatedStyle = useAnimatedStyle(() => {
      return {
        color: withTiming(active ? "#270984" : "#A0A0A0", {
          duration: 20,
        }),
        fontSize: withTiming(active ? 12 : 11, {
          duration: 20,
        }),
      };
    });

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push(tab.href as any)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={tab.icon as any}
          size={24} // Slightly smaller for better fit
          color={active ? "#270984" : "#A0A0A0"}
        />

        <Animated.Text style={[styles.tabLabel, textAnimatedStyle]}>
          {tab.label}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {/* Animated Blue Border - FIXED: Better positioning */}
        <Animated.View style={[styles.activeIndicator, borderAnimatedStyle]} />

        {/* Tab Buttons - using filtered tabs */}
        {tabs.map((tab, index) => (
          <TabButton key={tab.name} tab={tab} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  tabBar: {
    flexDirection: "row",
    height: 70, // Increased height for better touch area
    backgroundColor: "white",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    height: 3,
    backgroundColor: "#270984",
    borderRadius: 2,
  },
});

export default BottomTabBar;
