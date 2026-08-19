import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { colors, spacing, borderRadius } from "../../theme";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewProps["style"];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    padding: spacing.md,
  },
});
