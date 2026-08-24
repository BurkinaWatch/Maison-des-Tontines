import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme";

export default function TabsLayout() {
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
          title: "Home",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="tontines"
        options={{
          title: "Tontines",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🤝</Text>,
        }}
      />
      <Tabs.Screen
        name="contributions"
        options={{
          title: "Pay",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🔔</Text>,
          tabBarBadge: "3",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
