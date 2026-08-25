import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton, GlassInput } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { defaultProfilePreferences, loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from "../../src/utils/localPreferences";
import { CURRENCIES, LANGUAGES } from "../../src/utils/profileOptions";

export default function PreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultProfilePreferences);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { void loadProfilePreferences().then(setPreferences); }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const languages = useMemo(() => LANGUAGES.filter((item) =>
    !normalizedQuery || `${item.label} ${item.nativeLabel ?? ""} ${item.code}`.toLowerCase().includes(normalizedQuery)
  ), [normalizedQuery]);
  const currencies = useMemo(() => CURRENCIES.filter((item) =>
    !normalizedQuery || `${item.code} ${item.name}`.toLowerCase().includes(normalizedQuery)
  ), [normalizedQuery]);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppHeader title="Language & Currency" showBack />
        <View style={styles.card}>
          <Text style={styles.heading}>Language ({LANGUAGES.length})</Text>
          <GlassInput label="Search languages" value={query} onChangeText={setQuery} placeholder="Search by name or code" autoCapitalize="none" />
          {languages.map((item, index) => (
            <Option key={item.code} label={item.label} detail={item.nativeLabel && item.nativeLabel !== item.label ? item.nativeLabel : item.code.toUpperCase()} selected={preferences.language === item.code} onPress={() => setPreferences((p) => ({ ...p, language: item.code }))} last={index === languages.length - 1} />
          ))}
          {languages.length === 0 && <Text style={styles.noResults}>No language found.</Text>}
          <Text style={styles.heading}>Currency ({CURRENCIES.length})</Text>
          {currencies.map((item, index) => (
            <Option key={item.code} label={`${item.code} — ${item.name}`} detail={item.symbol} selected={preferences.currency === item.code} onPress={() => setPreferences((p) => ({ ...p, currency: item.code }))} last={index === currencies.length - 1} />
          ))}
          {currencies.length === 0 && <Text style={styles.noResults}>No currency found.</Text>}
        </View>
        <GlassButton title="Save preferences" onPress={save} loading={saving} style={styles.button} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function Option({ label, detail, selected, onPress, last }: { label: string; detail: string; selected: boolean; onPress: () => void; last: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, !last && styles.divider]}>
      <View style={styles.optionCopy}><Text style={styles.optionLabel}>{label}</Text><Text style={styles.optionDetail}>{detail}</Text></View>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  heading: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.xs },
  option: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  optionCopy: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  optionLabel: { ...typography.body, color: colors.textPrimary },
  optionDetail: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderLight, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  noResults: { ...typography.bodySmall, color: colors.textTertiary, paddingVertical: spacing.md },
  button: { marginHorizontal: spacing.md },
});