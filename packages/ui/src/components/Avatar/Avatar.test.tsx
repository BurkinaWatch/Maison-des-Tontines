import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { Avatar } from './Avatar';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: jest.fn(),
    colors: {
      primary: { 700: '#003d99', 200: '#cce0ff', 900: '#001433' },
      text: { primary: '#f8fafc' },
    },
  }),
}));

describe('Avatar', () => {
  it('renders initials when no uri', () => {
    const { getByText } = render(<Avatar name="John Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('renders single initial for single name', () => {
    const { getByText } = render(<Avatar name="John" />);
    expect(getByText('JO')).toBeTruthy();
  });
});
