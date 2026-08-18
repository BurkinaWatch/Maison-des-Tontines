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
import { GlassCard, ContributionRow, EmptyState } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useContributions } from "../../src/hooks/useContributions";

export default function ContributionHistoryScreen() {
  const { history, isLoading, refetch } = useContributions();

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
          title="Payment History"
          subtitle={`${history.length} transactions`}
          showBack
          showProfile
        />

        <View style={styles.content}>
          {history.length > 0 ? (
            history.map((contribution) => (
              <ContributionRow
                key={contribution.id}
                contribution={contribution}
                showTontineName
              />
            ))
          ) : (
            <EmptyState
              icon="📜"
              title="No history yet"
              description="Your payment history will appear here"
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
});
