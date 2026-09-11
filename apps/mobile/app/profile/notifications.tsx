import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { defaultProfilePreferences, loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from "../../src/utils/localPreferences";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultProfilePreferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfilePreferences().then(setPreferences);
  }, []);

  const update = (key: keyof ProfilePreferences, value: boolean) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await saveProfilePreferences(preferences);
      Alert.alert("Settings saved", "Your notification preferences were updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Unable to save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Notification Settings" showBack />
        <View style={styles.card}>
          <Setting label="Push notifications" description="Important updates about your account" value={preferences.pushNotifications} onChange={(value) => update("pushNotifications", value)} />
          <Setting label="Contribution reminders" description="Reminders before a contribution is due" value={preferences.contributionReminders} onChange={(value) => update("contributionReminders", value)} />
          <Setting label="Payout alerts" description="Know when a payout is ready" value={preferences.payoutAlerts} onChange={(value) => update("payoutAlerts", value)} last />
        </View>
        <GlassButton title="Save preferences" onPress={save} loading={saving} style={styles.button} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function Setting({ label, description, value, onChange, last }: { label: string; description: string; value: boolean; onChange: (value: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.description}>{description}</Text></View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  copy: { flex: 1 },
  label: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  button: { marginHorizontal: spacing.md },
});