import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassCard, EmptyState, StatusBadge, ContributionRow } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useContributions } from "../../src/hooks/useContributions";

export default function ContributionsScreen() {
  const { upcoming, history, isLoading, refetch } = useContributions();

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
          title="Contributions"
          subtitle="Manage your payments"
          showProfile
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcoming.length > 0 ? (
              upcoming.map((contribution) => (
                <ContributionRow
                  key={contribution.id}
                  contribution={contribution}
                  showTontineName
                />
              ))
            ) : (
              <GlassCard>
                <Text style={styles.emptyText}>No upcoming contributions</Text>
              </GlassCard>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            {history.length > 0 ? (
              history.map((contribution) => (
                <ContributionRow
                  key={contribution.id}
                  contribution={contribution}
                  showTontineName
                />
              ))
            ) : (
              <GlassCard>
                <Text style={styles.emptyText}>No payment history yet</Text>
              </GlassCard>
            )}
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
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    padding: spacing.md,
  },
});
