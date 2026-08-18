import React from 'react';
import { render } from '@testing-library/react-native';
import { Input } from './Input';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: jest.fn(),
    colors: {
      primary: { 500: '#0066ff' },
      error: { 500: '#ff0000' },
      background: { glass: 'rgba(255,255,255,0.05)', glassBorder: 'rgba(255,255,255,0.1)' },
      text: { primary: '#f8fafc', tertiary: '#94a3b8' },
      neutral: { 100: '#f1f3f5' },
    },
  }),
}));

describe('Input', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<Input label="Email" value="" onChangeText={() => {}} />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders error message', () => {
    const { getByText } = render(<Input label="Email" value="" onChangeText={() => {}} error="Required" />);
    expect(getByText('Required')).toBeTruthy();
  });
});
