import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassCard } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useNotifications } from "../../src/hooks/useNotifications";
import { formatRelativeDate } from "../../src/utils/formatters";

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefetching,
    isError,
    error,
    isMarkingAllAsRead,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();
  const [actionError, setActionError] = useState("");

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError("");
    try {
      await action();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Action failed. Please try again.");
    }
  };

  const openNotification = async (notification: (typeof notifications)[number]) => {
    await runAction(async () => {
      if (!notification.read) await markAsRead(notification.id);

      const data = notification.data ?? {};
      const id = (key: string) =>
        typeof data[key] === "string" ? (data[key] as string) : undefined;
      const category = id("category")?.toLowerCase();

      if (id("disputeId")) router.push(`/dispute/${id("disputeId")}`);
      else if (id("voteId")) router.push(`/vote/${id("voteId")}`);
      else if (id("payoutId")) router.push(`/payout/${id("payoutId")}`);
      else if (category === "invitations" || id("membershipId")) {
        router.push("/memberships/invitations");
      } else if (id("tontineId")) router.push(`/tontine/${id("tontineId")}`);
      else if (category === "payments" || id("transactionId")) {
        router.push("/contribution/history");
      }
    });
  };

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
      case "invitation":
        return "✉️";
      case "payment":
        return "💳";
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
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        <AppHeader
          title="Notifications"
          subtitle={`${unreadCount} unread`}
          showProfile
          rightAction={
            unreadCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={isMarkingAllAsRead}
                onPress={() => void runAction(markAllAsRead)}
              >
                <Text style={styles.markAll}>
                  {isMarkingAllAsRead ? "Updating…" : "Mark all read"}
                </Text>
              </Pressable>
            ) : undefined
          }
        />

        <View style={styles.content}>
          {actionError ? (
            <Text accessibilityRole="alert" style={styles.error}>{actionError}</Text>
          ) : null}
          {isError && notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.error}>
                {error instanceof Error ? error.message : "Could not load notifications."}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => void refetch()}>
                <Text style={styles.markAll}>Try again</Text>
              </Pressable>
            </View>
          ) : isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.message}>Loading notifications…</Text>
            </View>
          ) : notifications.length > 0 ? (
            <>
              {isError && (
                <Text style={styles.error}>
                  {error instanceof Error ? error.message : "Could not refresh notifications."}
                </Text>
              )}
              {notifications.map((notification) => (
              <View key={notification.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${notification.title}. ${notification.read ? "Read" : "Unread"}`}
                  onPress={() => void openNotification(notification)}
                >
                  <GlassCard
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.unreadCard,
                    ]}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>
                        {getTypeEmoji(notification.type.toLowerCase())}
                      </Text>
                    </View>
                    <View style={styles.notificationContent}>
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
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete notification"
                  hitSlop={8}
                  style={styles.deleteButton}
                  onPress={() => void runAction(() => deleteNotification(notification.id))}
                >
                  <Text style={styles.deleteText}>×</Text>
                </Pressable>
              </View>
              ))}
            </>
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
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  deleteButton: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.xs,
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  deleteText: {
    color: colors.textTertiary,
    fontSize: 22,
    lineHeight: 24,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    gap: spacing.md,
    paddingRight: spacing.xl,
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
