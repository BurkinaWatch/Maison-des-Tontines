import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Contribution } from "../../types/contribution";
import { colors, spacing, typography } from "../../theme";
import { formatCurrency, formatRelativeDate, getStatusColor } from "../../utils/formatters";

interface ContributionRowProps {
  contribution: Contribution;
  onPress?: () => void;
  showTontineName?: boolean;
}

export const ContributionRow: React.FC<ContributionRowProps> = ({
  contribution,
  onPress,
  showTontineName = false,
}) => {
  const statusColor = getStatusColor(contribution.status);

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <View style={[styles.icon, { borderColor: statusColor }]}>
            <Text style={[styles.iconText, { color: statusColor }]}>
              {contribution.status.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.info}>
          {showTontineName && (
            <Text style={styles.tontineName}>{contribution.tontineName}</Text>
          )}
          <Text style={styles.amount}>
            {formatCurrency(contribution.amount, contribution.currency)}
          </Text>
          <Text style={styles.date}>
            Due {formatRelativeDate(contribution.dueDate)}
          </Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {contribution.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  tontineName: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  amount: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rightContent: {
    marginLeft: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
});
