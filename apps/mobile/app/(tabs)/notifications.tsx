import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassCard, StatusBadge } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useNotifications } from "../../src/hooks/useNotifications";
import { Notification } from "../../src/services/notification.service";
import { formatRelativeDate } from "../../src/utils/formatters";

export default function NotificationsScreen() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch } =
    useNotifications();

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "contribution":
        return "💰";
      case "payout":
        return "💸";
      case "dispute":
        return "⚠️";
      case "vote":
        return "🗳️";
      default:
        return "📢";
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <AppHeader
          title="Notifications"
          subtitle={`${unreadCount} unread`}
          showProfile
          rightAction={
            unreadCount > 0 ? (
              <Pressable onPress={markAllAsRead}>
                <Text style={styles.markAll}>Mark all read</Text>
              </Pressable>
            ) : undefined
          }
        />

        <View style={styles.content}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
              >
                <GlassCard
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>
                      {getTypeEmoji(notification.type)}
                    </Text>
                  </View>
                  <View style={styles.content}>
                    <Text style={styles.title}>{notification.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.time}>
                      {formatRelativeDate(notification.createdAt)}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </GlassCard>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                You have no new notifications
              </Text>
            </View>
          )}
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
  markAll: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "600",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  unreadCard: {
    backgroundColor: colors.surfaceLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
