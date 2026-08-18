import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { glassColors, glassBorderRadius, glassSpacing } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { isDark } = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return glassColors.neutral[600];
    switch (variant) {
      case 'primary':
        return glassColors.primary[500];
      case 'secondary':
        return glassColors.secondary[500];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return glassColors.error[500];
      default:
        return glassColors.primary[500];
    }
  };

  const getTextColor = (): string => {
    if (disabled) return glassColors.neutral[400];
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#ffffff';
      case 'outline':
      case 'ghost':
        return isDark ? glassColors.text.primary : glassColors.neutral[800];
      default:
        return '#ffffff';
    }
  };

  const getBorderColor = (): string => {
    if (disabled) return glassColors.neutral[600];
    switch (variant) {
      case 'outline':
        return glassColors.primary[500];
      default:
        return 'transparent';
    }
  };

  const getPadding = (): number => {
    switch (size) {
      case 'sm':
        return glassSpacing[2];
      case 'md':
        return glassSpacing[3];
      case 'lg':
        return glassSpacing[4];
      default:
        return glassSpacing[3];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          paddingVertical: getPadding(),
          paddingHorizontal: getPadding() * 2,
          borderRadius: glassBorderRadius.md,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                marginLeft: icon ? glassSpacing[2] : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
