import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { glassColors, glassBorderRadius, glassSpacing } from '../../theme/colors';
import { GlassButton } from '../GlassButton';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  style?: ViewStyle;
}

export const GlassModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  closeOnBackdrop = true,
  style,
}) => {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: isDark ? glassColors.background.secondary : '#ffffff',
                  borderRadius: glassBorderRadius.xl,
                },
                style,
              ]}
            >
              {title && (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: glassColors.text.primary }]}>
                    {title}
                  </Text>
                </View>
              )}
              <View style={styles.content}>{children}</View>
              {footer && <View style={styles.footer}>{footer}</View>}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: glassSpacing[4],
  },
  container: {
    width: '100%',
    maxWidth: 400,
    padding: glassSpacing[5],
  },
  header: {
    marginBottom: glassSpacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    marginBottom: glassSpacing[4],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: glassSpacing[3],
  },
});
