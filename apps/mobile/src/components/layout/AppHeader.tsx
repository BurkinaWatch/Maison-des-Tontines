import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { colors, spacing, typography } from "../../theme";
import { useI18n } from "../../i18n";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showProfile?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const AppHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showProfile = false,
  rightAction,
  transparent = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const isAuthScreen = pathname.includes("/(auth)");

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.row}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>{"‹"}</Text>
          </Pressable>
        )}
        <View style={styles.titleContainer}>
           {title && <Text style={styles.title}>{t(title)}</Text>}
           {subtitle && <Text style={styles.subtitle}>{t(subtitle)}</Text>}
        </View>
        <View style={styles.rightContainer}>
          {rightAction}
          {showProfile && !isAuthScreen && (
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.profileButton}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transparent: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: "300",
    lineHeight: 36,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileIcon: {
    fontSize: 18,
  },
});
