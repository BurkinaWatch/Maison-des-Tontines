import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import {
  GlassCard,
  PotDisplay,
  StatusBadge,
  ContributionRow,
  EmptyState,
} from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useTontines } from "../../src/hooks/useTontines";
import { useContributions } from "../../src/hooks/useContributions";
import { formatCurrency } from "../../src/utils/formatters";

export default function DashboardScreen() {
  const router = useRouter();
  const { tontines, isLoading, refetch } = useTontines();
  const { upcoming } = useContributions();

  const activeTontines = tontines.filter((t) => t.status === "active");
  const upcomingContributions = upcoming.slice(0, 3);

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <AppHeader title="Dashboard" subtitle="Welcome back" showProfile />

        <View style={styles.content}>
          {activeTontines.length > 0 && activeTontines[0] && (
            <PotDisplay
              totalPot={activeTontines[0].amount * activeTontines[0].totalMembers}
              collected={activeTontines[0].amount * activeTontines[0].currentCycle}
              currency={activeTontines[0].currency}
              size="large"
            />
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Tontines</Text>
              <Pressable onPress={() => router.push("/(tabs)/tontines")}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {activeTontines.length > 0 ? (
              activeTontines.slice(0, 3).map((tontine) => (
                <Pressable
                  key={tontine.id}
                  onPress={() => router.push(`/tontine/${tontine.id}`)}
                >
                  <GlassCard style={styles.tontineCard}>
                    <View style={styles.tontineHeader}>
                      <Text style={styles.tontineName}>{tontine.name}</Text>
                      <StatusBadge status={tontine.status} />
                    </View>
                    <Text style={styles.tontineType}>
                      {tontine.type.charAt(0).toUpperCase() + tontine.type.slice(1)}{" "}
                      · {tontine.frequency}
                    </Text>
                    <View style={styles.tontineFooter}>
                      <Text style={styles.tontineAmount}>
                        {formatCurrency(tontine.amount, tontine.currency as any)}
                      </Text>
                      <Text style={styles.tontineCycle}>
                        Cycle {tontine.currentCycle}/{tontine.totalCycles}
                      </Text>
                    </View>
                  </GlassCard>
                </Pressable>
              ))
            ) : (
              <EmptyState
                icon="🤝"
                title="No active tontines"
                description="Join or create a tontine to get started"
                actionLabel="Create Tontine"
                onAction={() => router.push("/tontine/create")}
              />
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Contributions</Text>
              <Pressable onPress={() => router.push("/(tabs)/contributions")}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {upcomingContributions.length > 0 ? (
              upcomingContributions.map((contribution) => (
                <ContributionRow
                  key={contribution.id}
                  contribution={contribution}
                  showTontineName
                />
              ))
            ) : (
              <GlassCard>
                <Text style={styles.emptyText}>
                  No upcoming contributions
                </Text>
              </GlassCard>
            )}
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push("/tontine/create")}
              >
                <Text style={styles.actionEmoji}>➕</Text>
                <Text style={styles.actionLabel}>New Tontine</Text>
              </Pressable>
              <Pressable
                style={styles.actionCard}
                onPress={() => {
                  const contribution = upcomingContributions[0];
                  if (contribution) {
                    router.push(`/contribution/pay?tontineId=${contribution.tontineId}&cycleId=${contribution.cycleId}`);
                  } else {
                    router.push("/(tabs)/contributions");
                  }
                }}
              >
                <Text style={styles.actionEmoji}>💳</Text>
                <Text style={styles.actionLabel}>Pay Now</Text>
              </Pressable>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push("/(tabs)/notifications")}
              >
                <Text style={styles.actionEmoji}>🔔</Text>
                <Text style={styles.actionLabel}>Alerts</Text>
              </Pressable>
            </View>
          </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
  tontineCard: {
    marginBottom: spacing.sm,
  },
  tontineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  tontineName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
  },
  tontineType: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  tontineFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tontineAmount: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
  tontineCycle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    padding: spacing.md,
  },
  quickActions: {
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
