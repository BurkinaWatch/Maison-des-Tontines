import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import {
  GlassCard,
  PotDisplay,
  CycleVisualization,
  StatusBadge,
  EmptyState,
} from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useTontineStore } from "../../src/store/tontineStore";
import { formatCurrency, formatDate } from "../../src/utils/formatters";
import { Tontine, Cycle } from "../../src/types/tontine";

export default function TontineDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { selectedTontine, fetchTontine, fetchCycles, cycles, isLoading } =
    useTontineStore();
  const [tontine, setTontine] = useState<Tontine | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTontine(params.id);
      fetchCycles(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    setTontine(selectedTontine);
  }, [selectedTontine]);

  const completedCycles = cycles.filter((c: Cycle) => c.status === "completed").length;
  const currentCycle = tontine?.currentCycle || 0;
  const totalCycles = tontine?.totalCycles || 0;
  const totalPot = (tontine?.amount || 0) * (tontine?.totalMembers || 0);
  const collectedPot = (tontine?.amount || 0) * completedCycles;

  if (!tontine && !isLoading) {
    return (
      <SafeAreaWrapper>
        <AppHeader title="Tontine" showBack showProfile />
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="🤝"
            title="Tontine not found"
            description="The tontine you're looking for doesn't exist"
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchTontine(params.id)} />
        }
      >
        <AppHeader
          title={tontine?.name || "Tontine"}
          subtitle={tontine?.type || ""}
          showBack
          showProfile
          rightAction={
            <Pressable
              onPress={() => router.push(`/tontine/${params.id}/settings`)}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          }
        />

        <View style={styles.content}>
          <PotDisplay
            totalPot={totalPot}
            collected={collectedPot}
            currency={tontine?.currency || "FCFA"}
            size="large"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <GlassCard>
              <CycleVisualization
                totalCycles={totalCycles}
                currentCycle={currentCycle}
                completedCycles={completedCycles}
                size={180}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push(`/contribution/pay?tontineId=${params.id}`)}
              >
                <Text style={styles.actionEmoji}>💳</Text>
                <Text style={styles.actionLabel}>Pay</Text>
              </Pressable>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push(`/tontine/${params.id}/members`)}
              >
                <Text style={styles.actionEmoji}>👥</Text>
                <Text style={styles.actionLabel}>Members</Text>
              </Pressable>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push(`/tontine/${params.id}/cycles`)}
              >
                <Text style={styles.actionEmoji}>📅</Text>
                <Text style={styles.actionLabel}>Cycles</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            <GlassCard>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                {tontine && <StatusBadge status={tontine.status} />}
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {tontine ? tontine.type.charAt(0).toUpperCase() + tontine.type.slice(1) : ""}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Frequency</Text>
                <Text style={styles.infoValue}>
                  {tontine ? tontine.frequency.charAt(0).toUpperCase() + tontine.frequency.slice(1) : ""}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Started</Text>
                <Text style={styles.infoValue}>
                  {formatDate(tontine?.startDate || "")}
                </Text>
              </View>
            </GlassCard>
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  settingsIcon: {
    fontSize: 18,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
