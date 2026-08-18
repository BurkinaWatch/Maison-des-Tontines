import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { glassColors, glassBorderRadius, glassSpacing } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  title?: string;
  subtitle?: string;
  padding?: keyof typeof glassSpacing;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentStyle,
  title,
  subtitle,
  padding = 4,
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? glassColors.background.glass : glassColors.neutral[50],
          borderColor: glassColors.background.glassBorder,
          padding: glassSpacing[padding],
        },
        style,
      ]}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, { color: glassColors.text.primary }]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, { color: glassColors.text.secondary }]}>{subtitle}</Text>}
        </View>
      )}
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: glassBorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    marginBottom: glassSpacing[3],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
