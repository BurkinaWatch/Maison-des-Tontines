import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassCard, GlassButton, StatusBadge, MemberAvatar } from "../../src/components/ui";
import { DisputeForm } from "../../src/components/forms/DisputeForm";
import { colors, spacing, typography } from "../../src/theme";

export default function DisputeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitDispute = async (data: { reason: string; description: string }) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success", "Dispute submitted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to submit dispute");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Dispute" showBack showProfile />

        <View style={styles.content}>
          <GlassCard style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Text style={styles.disputeTitle}>Dispute #{params.id}</Text>
              <StatusBadge status="open" />
            </View>
            <Text style={styles.disputeDescription}>
              A dispute has been raised regarding this tontine. Review the details
              below and take appropriate action.
            </Text>
            <View style={styles.disputeMeta}>
              <View style={styles.disputeMetaItem}>
                <Text style={styles.disputeMetaLabel}>Raised by</Text>
                <MemberAvatar name="Marie Kouassi" size="small" />
              </View>
              <View style={styles.disputeMetaItem}>
                <Text style={styles.disputeMetaLabel}>Date</Text>
                <Text style={styles.disputeMetaValue}>Today</Text>
              </View>
            </View>
          </GlassCard>

          <DisputeForm
            tontineId={params.id as string}
            onSubmit={handleSubmitDispute}
            isLoading={isLoading}
          />
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
  disputeCard: {
    marginBottom: spacing.lg,
  },
  disputeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  disputeTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  disputeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  disputeMeta: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  disputeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  disputeMetaLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  disputeMetaValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
