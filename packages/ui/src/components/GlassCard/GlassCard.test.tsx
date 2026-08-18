import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { render } from '@testing-library/react-native';
import { glassColors, glassBorderRadius, glassSpacing } from '../../theme/colors';

const mockTheme = {
  isDark: true,
  toggleTheme: jest.fn(),
  colors: glassColors,
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => mockTheme,
}));

import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>Test content</Text>
      </GlassCard>
    );
    expect(getByText('Test content')).toBeTruthy();
  });

  it('renders title and subtitle when provided', () => {
    const { getByText } = render(
      <GlassCard title="Card Title" subtitle="Card subtitle">
        <Text>Content</Text>
      </GlassCard>
    );
    expect(getByText('Card Title')).toBeTruthy();
    expect(getByText('Card subtitle')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { UNSAFE_root } = render(
      <GlassCard style={{ opacity: 0.8 }}>
        <Text>Content</Text>
      </GlassCard>
    );
    expect(UNSAFE_root.props.style).toMatchObject({ opacity: 0.8 });
  });
});
