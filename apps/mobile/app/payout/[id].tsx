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
import { GlassCard, GlassButton, PotDisplay, StatusBadge, MemberAvatar } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";

export default function PayoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [isRequesting, setIsRequesting] = useState(false);

  const payoutAmount = 250000;
  const penaltyAmount = 25000;
  const netAmount = payoutAmount - penaltyAmount;

  const handleRequestEarlyPayout = async () => {
    setIsRequesting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success", "Early payout request submitted", [
        { text: "OK" },
      ]);
    } catch {
      Alert.alert("Error", "Failed to request early payout");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Payout Details"
          showBack
          showProfile
        />

        <View style={styles.content}>
          <GlassCard style={styles.payoutCard}>
            <Text style={styles.payoutLabel}>Payout Amount</Text>
            <Text style={styles.payoutAmount}>
              {payoutAmount.toLocaleString()} XOF
            </Text>
            <StatusBadge status="processing" />
          </GlassCard>

          <PotDisplay
            totalPot={payoutAmount}
            collected={netAmount}
            currency="FCFA"
            size="medium"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipient</Text>
            <GlassCard>
              <View style={styles.recipientRow}>
                <MemberAvatar name="Aminata Diallo" size="medium" />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>Aminata Diallo</Text>
                  <Text style={styles.recipientPhone}>+225 01 00 00 00</Text>
                </View>
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breakdown</Text>
            <GlassCard>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Gross Amount</Text>
                <Text style={styles.breakdownValue}>
                  {payoutAmount.toLocaleString()} XOF
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Early Payout Penalty</Text>
                <Text style={[styles.breakdownValue, styles.negative]}>
                  -{penaltyAmount.toLocaleString()} XOF
                </Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Net Amount</Text>
                <Text style={styles.totalValue}>
                  {netAmount.toLocaleString()} XOF
                </Text>
              </View>
            </GlassCard>
          </View>

          <GlassButton
            title="Request Early Payout"
            onPress={handleRequestEarlyPayout}
            loading={isRequesting}
            style={styles.actionButton}
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
  payoutCard: {
    alignItems: "center",
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  payoutLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  payoutAmount: {
    ...typography.display,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  recipientPhone: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  negative: {
    color: colors.error,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  totalValue: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "700",
  },
  actionButton: {
    marginTop: spacing.lg,
  },
});
