import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme";
import { useI18n } from "../../src/i18n";
import { BrandLogo } from "../../src/components/BrandLogo";
import { useNotifications } from "../../src/hooks/useNotifications";

export default function TabsLayout() {
  const { t } = useI18n();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();
  const tabBarInsets = {
    ...insets,
    // Some Android edge-to-edge builds report a zero bottom inset even while
    // the system navigation controls overlay the app content.
    bottom:
      Platform.OS === "android" ? Math.max(insets.bottom, 24) : insets.bottom,
  };

  return (
    <Tabs
      safeAreaInsets={tabBarInsets}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
           title: t("Home"),
          tabBarIcon: () => <BrandLogo variant="mark" width={24} height={24} />,
        }}
      />
      <Tabs.Screen
        name="tontines"
        options={{
           title: t("Tontines"),
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🤝</Text>,
        }}
      />
      <Tabs.Screen
        name="contributions"
        options={{
           title: t("Pay"),
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
           title: t("Alerts"),
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🔔</Text>,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
           title: t("Me"),
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
