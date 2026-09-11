import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { colors, spacing, typography } from "../../src/theme";

const faq = [
  ["How do I join a tontine?", "Open Tontines, select a group, and follow the join instructions from the group administrator."],
  ["How do contributions work?", "Your contribution is recorded against the active cycle. Check Contributions for status and history."],
  ["I need help with a payment", "Do not share card numbers or passwords. Contact support with your account phone number and a description of the issue."],
];

export default function HelpScreen() {
  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Help & Support" showBack />
        <View style={styles.card}>
          {faq.map(([question, answer]) => <View key={question} style={styles.faq}><Text style={styles.question}>{question}</Text><Text style={styles.answer}>{answer}</Text></View>)}
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL("mailto:support@maisondestontines.com")} style={styles.contact}>
            <Text style={styles.contactText}>Email support@maisondestontines.com</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  faq: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  question: { ...typography.body, color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.xs },
  answer: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 21 },
  contact: { paddingVertical: spacing.lg },
  contactText: { ...typography.body, color: colors.accent, fontWeight: "600" },
});