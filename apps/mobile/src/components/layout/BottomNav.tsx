import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { colors, spacing, typography } from "../../theme";

interface TabItem {
  name: string;
  label: string;
  icon: string;
  path: string;
}

const tabs: TabItem[] = [
  { name: "dashboard", label: "Home", icon: "🏠", path: "/(tabs)/" },
  { name: "tontines", label: "Tontines", icon: "🤝", path: "/(tabs)/tontines" },
  { name: "contributions", label: "Pay", icon: "💰", path: "/(tabs)/contributions" },
  { name: "notifications", label: "Alerts", icon: "🔔", path: "/(tabs)/notifications" },
  { name: "profile", label: "Me", icon: "👤", path: "/(tabs)/profile" },
];

export const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.path ||
          (tab.name === "dashboard" && pathname === "/(tabs)/");

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.path as any)}
            style={styles.tab}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.icon,
                isActive && styles.activeIcon,
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "ios" ? 24 : spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  activeLabel: {
    color: colors.accent,
    fontWeight: "600",
  },
});
