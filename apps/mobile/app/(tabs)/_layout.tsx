import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme";
import { useI18n } from "../../src/i18n";

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
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
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
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
          tabBarBadge: "3",
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
