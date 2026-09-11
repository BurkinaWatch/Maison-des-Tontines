import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { GlassCard, GlassInput, GlassButton } from "../ui";
import { colors, spacing, typography } from "../../theme";
import { useI18n } from "../../i18n";

interface DisputeFormProps {
  tontineId: string;
  cycleId?: string;
  contributionId?: string;
  onSubmit: (data: { reason: string; description: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const DisputeForm: React.FC<DisputeFormProps> = ({
  tontineId,
  cycleId,
  contributionId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    t("Payment not recorded"),
    t("Wrong amount charged"),
    t("Member not present"),
    t("Payout not received"),
    t("Technical issue"),
    t("Other"),
  ];

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ reason, description });
    } catch (error) {
      console.error("Dispute error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("Raise a Dispute")}</Text>
      <Text style={styles.subtitle}>
        {t("Report an issue with your tontine contribution or payout")}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t("Reason")}</Text>
        <View style={styles.reasonsContainer}>
          {reasons.map((r) => (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              style={[
                styles.reasonButton,
                reason === r && styles.reasonButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.reasonText,
                  reason === r && styles.reasonTextActive,
                ]}
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <GlassInput
          label={t("Description")}
          value={description}
          onChangeText={setDescription}
          placeholder={t("Provide details about the issue...")}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ {t("Dispute Process")}</Text>
        <Text style={styles.infoText}>
          {t("Disputes are reviewed by the tontine admin and members. You will be notified of the resolution within 7 days.")}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        {onCancel && (
          <GlassButton
            title={t("Cancel")}
            onPress={onCancel}
            variant="secondary"
            style={styles.button}
          />
        )}
        <GlassButton
          title={t("Submit Dispute")}
          onPress={handleSubmit}
          loading={isSubmitting || isLoading}
          disabled={!reason}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

import { Pressable } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  reasonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  reasonButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonButtonActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}15`,
  },
  reasonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reasonTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
});
