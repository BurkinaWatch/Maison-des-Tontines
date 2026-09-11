import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { colors, spacing, typography } from "../../src/theme";

export default function LegalScreen() {
  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Terms & Privacy" showBack />
        <View style={styles.card}>
          <Text style={styles.updated}>Last updated: August 2026</Text>
          <Text style={styles.heading}>Your account</Text>
          <Text style={styles.body}>Keep your password and verification codes private. You are responsible for activity performed from your account.</Text>
          <Text style={styles.heading}>Your data</Text>
          <Text style={styles.body}>We use your name, phone number, email address, and tontine activity to provide the service and keep accurate financial records. We do not display your password.</Text>
          <Text style={styles.heading}>Security</Text>
          <Text style={styles.body}>Contact support promptly if you suspect unauthorized access. Never send payment credentials or passwords by email or chat.</Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  updated: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.lg },
  heading: { ...typography.heading3, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 23 },
});