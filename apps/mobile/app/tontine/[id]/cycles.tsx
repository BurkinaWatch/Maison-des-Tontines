import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../../src/components/layout";
import { AppHeader } from "../../../src/components/layout/AppHeader";
import { GlassCard, StatusBadge, EmptyState } from "../../../src/components/ui";
import { colors, spacing, typography } from "../../../src/theme";
import { useTontineStore } from "../../../src/store/tontineStore";
import { formatCurrency, formatDate } from "../../../src/utils/formatters";
import { Cycle } from "../../../src/types/tontine";

export default function CyclesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { cycles, fetchCycles, isLoading } = useTontineStore();
  const [tontineName, setTontineName] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchCycles(params.id);
    }
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "current":
        return colors.accent;
      case "upcoming":
        return colors.textTertiary;
      case "skipped":
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchCycles(params.id)}
          />
        }
      >
        <AppHeader
          title="Cycles"
          subtitle={`${cycles.length} total`}
          showBack
          showProfile
        />

        <View style={styles.content}>
          {cycles.length > 0 ? (
            cycles.map((cycle: Cycle) => (
              <GlassCard key={cycle.id} style={styles.cycleCard}>
                <View style={styles.cycleHeader}>
                  <View style={styles.cycleNumberContainer}>
                    <Text style={styles.cycleNumber}>{cycle.cycleNumber}</Text>
                  </View>
                  <View style={styles.cycleInfo}>
                    <Text style={styles.cycleDate}>
                      {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                    </Text>
                    <Text style={styles.cycleDue}>
                      Due: {formatDate(cycle.dueDate)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(cycle.status) },
                    ]}
                  />
                </View>
                <View style={styles.cycleFooter}>
                  <Text style={styles.potAmount}>
                    Pot: {formatCurrency(cycle.potAmount, "XOF")}
                  </Text>
                  {cycle.payoutRecipientId && (
                    <Text style={styles.recipient}>
                      Recipient: {cycle.payoutRecipientId}
                    </Text>
                  )}
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState
              icon="📅"
              title="No cycles yet"
              description="Cycles will appear here once the tontine starts"
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
  cycleCard: {
    marginBottom: spacing.sm,
  },
  cycleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cycleNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cycleNumber: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "700",
  },
  cycleInfo: {
    flex: 1,
  },
  cycleDate: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  cycleDue: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cycleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  potAmount: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
  recipient: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
