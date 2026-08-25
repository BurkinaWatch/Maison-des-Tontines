import React from "react";
import { View, Text, StyleSheet, TextStyle } from "react-native";
import { colors, spacing, typography } from "../../theme";
import { useI18n } from "../../i18n";

interface PotDisplayProps {
  totalPot: number;
  collected: number;
  currency?: string;
  size?: "small" | "medium" | "large";
}

export const PotDisplay: React.FC<PotDisplayProps> = ({
  totalPot,
  collected,
  currency = "FCFA",
  size = "medium",
}) => {
  const { t } = useI18n();
  const progress = totalPot > 0 ? (collected / totalPot) * 100 : 0;

  const sizeStyles: Record<"small" | "medium" | "large", { amount: TextStyle; label: TextStyle }> = {
    small: {
      amount: typography.heading2,
      label: typography.caption,
    },
    medium: {
      amount: typography.display,
      label: typography.bodySmall,
    },
    large: {
      amount: { fontSize: 40, fontWeight: "700", lineHeight: 48, letterSpacing: -0.5 },
      label: typography.body,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, sizeStyles[size].label]}>{t("Total Pot")}</Text>
        <Text style={[styles.amount, sizeStyles[size].amount]}>
          {totalPot.toLocaleString()} {currency}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% {t("collected")}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("Collected")}</Text>
          <Text style={styles.statValue}>
            {collected.toLocaleString()} {currency}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("Remaining")}</Text>
          <Text style={styles.statValue}>
            {(totalPot - collected).toLocaleString()} {currency}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  amount: {
    color: colors.accent,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600" as const,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
});
