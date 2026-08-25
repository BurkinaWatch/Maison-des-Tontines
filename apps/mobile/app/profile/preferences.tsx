import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { defaultProfilePreferences, loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from "../../src/utils/localPreferences";

export default function PreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultProfilePreferences);
  const [saving, setSaving] = useState(false);
  useEffect(() => { loadProfilePreferences().then(setPreferences); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveProfilePreferences(preferences);
      Alert.alert("Preferences saved", "Your language and currency preferences were updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Unable to save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Language & Currency" showBack />
        <View style={styles.card}>
          <Text style={styles.heading}>Language</Text>
          <Option label="English" selected={preferences.language === "English"} onPress={() => setPreferences((p) => ({ ...p, language: "English" }))} />
          <Option label="Français" selected={preferences.language === "Français"} onPress={() => setPreferences((p) => ({ ...p, language: "Français" }))} />
          <Text style={styles.heading}>Currency</Text>
          <Option label="XOF — West African CFA franc" selected={preferences.currency === "XOF"} onPress={() => setPreferences((p) => ({ ...p, currency: "XOF" }))} />
          <Option label="EUR — Euro" selected={preferences.currency === "EUR"} onPress={() => setPreferences((p) => ({ ...p, currency: "EUR" }))} last />
        </View>
        <GlassButton title="Save preferences" onPress={save} loading={saving} style={styles.button} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function Option({ label, selected, onPress, last }: { label: string; selected: boolean; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, !last && styles.divider]}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  heading: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.xs },
  option: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  optionLabel: { ...typography.body, color: colors.textPrimary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderLight, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  button: { marginHorizontal: spacing.md },
});