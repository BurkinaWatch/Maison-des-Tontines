import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { glassColors, glassBorderRadius, glassSpacing } from '../../theme/colors';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: StatusSize;
  style?: object;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const { isDark } = useTheme();

  const getBackgroundColor = (): string => {
    const colors = glassColors[variant === 'info' ? 'primary' : variant];
    return isDark ? colors[900] : colors[100];
  };

  const getTextColor = (): string => {
    const colors = glassColors[variant === 'info' ? 'primary' : variant];
    return isDark ? colors[200] : colors[800];
  };

  const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
    switch (size) {
      case 'sm':
        return { paddingVertical: glassSpacing[1], paddingHorizontal: glassSpacing[2] };
      case 'md':
        return { paddingVertical: glassSpacing[1], paddingHorizontal: glassSpacing[3] };
      case 'lg':
        return { paddingVertical: glassSpacing[2], paddingHorizontal: glassSpacing[4] };
      default:
        return { paddingVertical: glassSpacing[1], paddingHorizontal: glassSpacing[3] };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 12;
      case 'md':
        return 14;
      case 'lg':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: glassBorderRadius.full,
          ...getPadding(),
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
