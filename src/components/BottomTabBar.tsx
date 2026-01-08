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
  showForTec?: boolean; // Property to control visibility
  showForSup?: boolean;
}

const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const baseTabs: Tab[] = [
    {
      name: "order-notes",
      href: "/order-notes",
      icon: "list-outline",
      label: "Programação",
      showForTec: true, // Only show for tecnician users
    },
    {
      name: "order-sat",
      href: "/order-sat",
      icon: "list",
      label: "SATs",
      showForSup: true, // Only show for supervisor users
    },
    {
      name: "on-call",
      href: "/on-call",
      icon: "notifications-outline",
      label: "Sobreaviso",
      showForSup: true, // Only show for supervisor users
    },
  ];

  // Filter tabs based on user role
  const tabs = baseTabs.filter((tab) => {
    let shouldShow = false;

    if (tab.showForTec && user?.tecId) {
      shouldShow = true;
    }

    if (tab.showForSup && user?.supId) {
      shouldShow = true;
    }

    // Se a aba não tiver restrição de papel, mostramos sempre
    if (!tab.showForTec && !tab.showForSup) {
      shouldShow = true;
    }

    return shouldShow;
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
  container: {},
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
