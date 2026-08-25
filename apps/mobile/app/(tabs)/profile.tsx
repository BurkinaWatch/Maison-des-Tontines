import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassCard, GlassButton, StatusBadge } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: "👤", label: "Edit Profile", action: () => router.push("/profile/edit") },
    { icon: "🔒", label: "Change Password", action: () => router.push("/profile/password") },
    { icon: "🔔", label: "Notification Settings", action: () => router.push("/profile/notifications") },
    { icon: "💳", label: "Payment Methods", action: () => router.push("/profile/payment-methods") },
    {
      icon: "🌍",
      label: "Language & Currency",
      action: () => Alert.alert("Language & Currency", "Language: English\nCurrency: XOF\n\nMore options will be available soon."),
    },
    {
      icon: "❓",
      label: "Help & Support",
      action: () => Alert.alert("Help & Support", "For assistance, contact support@maisondestontines.com."),
    },
    {
      icon: "📄",
      label: "Terms & Privacy",
      action: () => Alert.alert(
        "Terms & Privacy",
        "Your personal data is used only to operate your tontine account. Never share your password or verification codes."
      ),
    },
  ];

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Profile" showProfile={false} />

        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user
                  ? `${user.firstName[0]}${user.lastName[0]}`
                  : "?"}
              </Text>
            </View>
            <Text style={styles.name}>
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </Text>
            <Text style={styles.phone}>
              {user?.phoneNumber || "Not signed in"}
            </Text>
            {user?.role && (
              <StatusBadge
                status={user.role}
                size="small"
              />
            )}
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.action}
                style={styles.menuItem}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          <GlassButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            style={styles.logoutButton}
          />

          <Text style={styles.version}>
            Maison des Tontines v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.heading1,
    color: colors.accent,
  },
  name: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  phone: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  menuArrow: {
    ...typography.heading3,
    color: colors.textTertiary,
    fontWeight: "300",
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
