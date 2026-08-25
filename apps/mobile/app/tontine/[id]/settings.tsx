import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../../src/components/layout";
import { AppHeader } from "../../../src/components/layout/AppHeader";
import { GlassCard, GlassButton, GlassInput } from "../../../src/components/ui";
import { colors, spacing, typography } from "../../../src/theme";
import { useI18n } from "../../../src/i18n";

export default function TontineSettingsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [allowLatePayment, setAllowLatePayment] = useState(true);
  const [requireVoteForAbsent, setRequireVoteForAbsent] = useState(true);
  const [allowEarlyPayout, setAllowEarlyPayout] = useState(true);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState("5");
  const [earlyPayoutPenalty, setEarlyPayoutPenalty] = useState("10");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert(t("Success"), t("Settings saved successfully"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t("Error"), t("Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTontine = () => {
    Alert.alert(
      t("Delete Tontine"),
      t("This action cannot be undone. Are you sure?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title={t("Settings")}
          subtitle={t("Manage tontine rules")}
          showBack
          showProfile
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Contribution Rules")}</Text>
            <GlassCard>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t("Allow Late Payment")}</Text>
                  <Text style={styles.settingDescription}>{t("Members can pay after the due date")}</Text>
                </View>
                <Switch
                  value={allowLatePayment}
                  onValueChange={setAllowLatePayment}
                  trackColor={{ false: colors.surfaceDark, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              </View>
              {allowLatePayment && (
                <GlassInput
                  label={t("Late Penalty (%)")}
                  value={latePenaltyPercent}
                  onChangeText={setLatePenaltyPercent}
                  keyboardType="numeric"
                />
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Voting Rules")}</Text>
            <GlassCard>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t("Require Vote for Absent")}</Text>
                  <Text style={styles.settingDescription}>
                    {t("Members must vote when absent")}
                  </Text>
                </View>
                <Switch
                  value={requireVoteForAbsent}
                  onValueChange={setRequireVoteForAbsent}
                  trackColor={{ false: colors.surfaceDark, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Payout Rules")}</Text>
            <GlassCard>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t("Allow Early Payout")}</Text>
                  <Text style={styles.settingDescription}>
                    {t("Members can request payout early")}
                  </Text>
                </View>
                <Switch
                  value={allowEarlyPayout}
                  onValueChange={setAllowEarlyPayout}
                  trackColor={{ false: colors.surfaceDark, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              </View>
              {allowEarlyPayout && (
                <GlassInput
                  label={t("Early Payout Penalty (%)")}
                  value={earlyPayoutPenalty}
                  onChangeText={setEarlyPayoutPenalty}
                  keyboardType="numeric"
                />
              )}
            </GlassCard>
          </View>

          <GlassButton
            title={t("Save Changes")}
            onPress={handleSave}
            loading={isSaving}
            style={styles.saveButton}
          />

          <Pressable onPress={handleDeleteTontine} style={styles.deleteButton}>
            <Text style={styles.deleteText}>{t("Delete Tontine")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  deleteButton: {
    alignItems: "center",
    padding: spacing.md,
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: "600",
  },
});
