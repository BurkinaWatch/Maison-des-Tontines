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
import { GlassCard, GlassButton, GlassInput, StatusBadge, MemberAvatar } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";

export default function VoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [selectedVote, setSelectedVote] = useState<"approve" | "reject" | "abstain" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedVote) {
      Alert.alert("Error", "Please select a vote");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Your vote has been recorded", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteOptions = [
    { value: "approve" as const, label: "Approve", emoji: "✅", color: colors.success },
    { value: "reject" as const, label: "Reject", emoji: "❌", color: colors.error },
    { value: "abstain" as const, label: "Abstain", emoji: "⚪", color: colors.textTertiary },
  ];

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Cast Vote" showBack showProfile />

        <View style={styles.content}>
          <GlassCard style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Text style={styles.disputeTitle}>Dispute #{params.id}</Text>
              <StatusBadge status="open" />
            </View>
            <Text style={styles.disputeDescription}>
              Member has raised a dispute regarding a contribution payment.
              Please review and cast your vote.
            </Text>
            <View style={styles.disputeMeta}>
              <View style={styles.disputeMetaItem}>
                <Text style={styles.disputeMetaLabel}>Raised by</Text>
                <MemberAvatar name="Jean Dupont" size="small" />
              </View>
              <View style={styles.disputeMetaItem}>
                <Text style={styles.disputeMetaLabel}>Date</Text>
                <Text style={styles.disputeMetaValue}>Today</Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Vote</Text>
            <View style={styles.voteOptions}>
              {voteOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setSelectedVote(option.value)}
                  style={[
                    styles.voteCard,
                    selectedVote === option.value && {
                      borderColor: option.color,
                      backgroundColor: `${option.color}15`,
                    },
                  ]}
                >
                  <Text style={styles.voteEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.voteLabel,
                      selectedVote === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <GlassInput
              label="Comment (Optional)"
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment to your vote..."
              multiline
              numberOfLines={4}
            />
          </View>

          <GlassButton
            title="Submit Vote"
            onPress={handleVote}
            loading={isSubmitting}
            disabled={!selectedVote}
            style={styles.submitButton}
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
    marginBottom: spacing.xl,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  voteOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  voteCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  voteEmoji: {
    fontSize: 32,
  },
  voteLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
