import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { GlassModal } from './Modal';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: jest.fn(),
    colors: {
      background: { secondary: '#111827', glass: 'rgba(255,255,255,0.05)', glassBorder: 'rgba(255,255,255,0.1)' },
      text: { primary: '#f8fafc' },
    },
  }),
}));

describe('GlassModal', () => {
  it('renders when visible', () => {
    const { getByText } = render(
      <GlassModal visible={true} onClose={() => {}} title="Test">
        <Text>Modal content</Text>
      </GlassModal>
    );
    expect(getByText('Test')).toBeTruthy();
    expect(getByText('Modal content')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <GlassModal visible={false} onClose={() => {}}>
        <Text>Hidden</Text>
      </GlassModal>
    );
    expect(queryByText('Hidden')).toBeNull();
  });
});
