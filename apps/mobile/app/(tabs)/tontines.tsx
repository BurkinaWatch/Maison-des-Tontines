import React, { useEffect } from "react";
import {
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
import { GlassCard, EmptyState, StatusBadge } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useTontines } from "../../src/hooks/useTontines";
import { formatCurrency, formatDate } from "../../src/utils/formatters";
import { TontineType } from "../../src/types/tontine";

const typeEmojis: Record<TontineType, string> = {
  rotating: "🔄",
  savings: "🏦",
  investment: "📈",
  social: "🤝",
};

export default function TontinesScreen() {
  const router = useRouter();
  const { tontines, isLoading, refetch } = useTontines();

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
          title="Tontines"
          subtitle={`${tontines.length} total`}
          showProfile
          rightAction={
            <Pressable
              onPress={() => router.push("/tontine/create")}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>+</Text>
            </Pressable>
          }
        />

        <View style={styles.content}>
          {tontines.length > 0 ? (
            tontines.map((tontine) => (
              <Pressable
                key={tontine.id}
                onPress={() => router.push(`/tontine/${tontine.id}`)}
              >
                <GlassCard style={styles.tontineCard}>
                  <View style={styles.header}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>
                        {typeEmojis[tontine.type]}
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{tontine.name}</Text>
                      <Text style={styles.description} numberOfLines={2}>
                        {tontine.description}
                      </Text>
                    </View>
                    <StatusBadge status={tontine.status} />
                  </View>
                  <View style={styles.footer}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Amount</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(tontine.amount, tontine.currency as any)}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Members</Text>
                      <Text style={styles.statValue}>
                        {tontine.totalMembers}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Cycle</Text>
                      <Text style={styles.statValue}>
                        {tontine.currentCycle}/{tontine.totalCycles}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.date}>
                    Started {formatDate(tontine.startDate)}
                  </Text>
                </GlassCard>
              </Pressable>
            ))
          ) : (
            <EmptyState
              icon="🤝"
              title="No tontines yet"
              description="Create your first tontine and start building wealth together"
              actionLabel="Create Tontine"
              onAction={() => router.push("/tontine/create")}
            />
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
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "300",
    lineHeight: 28,
  },
  tontineCard: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "right",
    marginTop: spacing.sm,
  },
});
