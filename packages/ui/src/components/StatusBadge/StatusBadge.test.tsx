import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { StatusBadge } from './StatusBadge';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: jest.fn(),
    colors: {
      primary: { 500: '#0066ff', 800: '#002966', 900: '#001433', 200: '#66a3ff' },
      success: { 800: '#004e2d', 900: '#002719', 200: '#99e7c3' },
      warning: { 800: '#664d00', 900: '#332600', 200: '#ffe699' },
      error: { 800: '#660000', 900: '#330000', 200: '#ff9999' },
      neutral: { 800: '#343a40', 900: '#212529', 100: '#f1f3f5', 200: '#e9ecef' },
      background: { glass: 'rgba(255,255,255,0.05)', glassBorder: 'rgba(255,255,255,0.1)' },
      text: { primary: '#f8fafc', secondary: '#cbd5e1', tertiary: '#94a3b8', inverse: '#0f172a' },
    },
  }),
}));

describe('StatusBadge', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<StatusBadge label="Active" />);
    expect(getByText('Active')).toBeTruthy();
  });

  it('renders uppercase label', () => {
    const { getByText } = render(<StatusBadge label="active" />);
    expect(getByText('ACTIVE')).toBeTruthy();
  });
});
