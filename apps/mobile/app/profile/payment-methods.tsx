import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";

export default function PaymentMethodsScreen() {
  const addMethod = () =>
    Alert.alert("Payment methods", "Mobile money and card payments will be available when a payment provider is connected. No payment details are collected until then.");

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Payment Methods" showBack />
        <View style={styles.card}>
          <Text style={styles.icon}>💳</Text>
          <Text style={styles.title}>No payment method added</Text>
          <Text style={styles.description}>Add a payment method to make contributions faster. Your full card or mobile money details should never be shared in chat.</Text>
          <GlassButton title="Add payment method" onPress={addMethod} />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.heading3, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg, lineHeight: 22 },
});