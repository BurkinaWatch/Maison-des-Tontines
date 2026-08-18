import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { glassColors, glassBorderRadius, glassSpacing } from '../../theme/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={style}>
      {label && <Text style={[styles.label, { color: glassColors.text.primary }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={glassColors.text.tertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? glassColors.background.glass : glassColors.neutral[100],
            borderColor: error ? glassColors.error[500] : glassColors.background.glassBorder,
            color: glassColors.text.primary,
          },
        ]}
      />
      {error && <Text style={[styles.error, { color: glassColors.error[500] }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: glassSpacing[1],
  },
  input: {
    borderRadius: glassBorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: glassSpacing[3],
    paddingVertical: glassSpacing[3],
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: glassSpacing[1],
  },
});
