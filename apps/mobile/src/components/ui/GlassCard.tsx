import React from "react";
import { View, ViewProps, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
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
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint="dark" style={[styles.container, style]}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.androidContainer, style]} {...props}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  androidContainer: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    padding: spacing.md,
  },
});
