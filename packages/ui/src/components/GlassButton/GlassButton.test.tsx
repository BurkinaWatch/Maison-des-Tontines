import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { GlassButton } from './GlassButton';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: jest.fn(),
    colors: {
      background: { glass: 'rgba(255,255,255,0.05)', glassBorder: 'rgba(255,255,255,0.1)' },
      text: { primary: '#f8fafc', secondary: '#cbd5e1', tertiary: '#94a3b8', inverse: '#0f172a' },
      neutral: { 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 800: '#1f2937' },
      primary: { 500: '#0066ff' },
      secondary: { 500: '#ff8000' },
      error: { 500: '#ff0000' },
    },
  }),
}));

describe('GlassButton', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<GlassButton title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('renders loading state', () => {
    const { queryByText } = render(<GlassButton title="Click me" loading />);
    expect(queryByText('Click me')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<GlassButton title="Click" onPress={onPress} />);
    getByText('Click').props.onPress();
    expect(onPress).toHaveBeenCalled();
  });
});
