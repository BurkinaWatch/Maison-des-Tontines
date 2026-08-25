import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";
import { useI18n } from "../../i18n";

interface StatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "medium" }) => {
  const { t } = useI18n();
  const normalizedStatus = status.toLowerCase().replace(" ", "_");
  const statusColor = getStatusColor(normalizedStatus);

  const sizeStyles = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      fontSize: 10,
    },
    medium: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      fontSize: 12,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${statusColor}20` },
        sizeStyles[size],
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: statusColor, fontSize: sizeStyles[size].fontSize },
        ]}
      >
        {t(status.replace(/_/g, " ")).toUpperCase()}
      </Text>
    </View>
  );
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: colors.warning,
    paid: colors.success,
    late: colors.warning,
    missed: colors.error,
    active: colors.success,
    completed: colors.success,
    suspended: colors.error,
    draft: colors.warning,
    open: colors.warning,
    under_review: colors.warning,
    resolved: colors.success,
    closed: colors.textTertiary,
    processing: colors.warning,
    failed: colors.error,
    upcoming: colors.textTertiary,
    current: colors.accent,
    skipped: colors.error,
    approve: colors.success,
    reject: colors.error,
    abstain: colors.textTertiary,
  };
  return statusColors[status] || colors.textTertiary;
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
