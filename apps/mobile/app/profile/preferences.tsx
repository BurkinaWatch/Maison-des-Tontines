import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton, GlassInput } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { defaultProfilePreferences, loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from "../../src/utils/localPreferences";
import { CURRENCIES, LANGUAGES } from "../../src/utils/profileOptions";
import { useI18n } from "../../src/i18n";

export default function PreferencesScreen() {
  const router = useRouter();
  const { t, setLanguage } = useI18n();
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultProfilePreferences);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"language" | "currency" | null>(null);
  useEffect(() => { void loadProfilePreferences().then(setPreferences); }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const languages = useMemo(() => LANGUAGES.filter((item) =>
    !normalizedQuery || `${item.label} ${item.nativeLabel ?? ""} ${item.code}`.toLowerCase().includes(normalizedQuery)
  ), [normalizedQuery]);
  const currencies = useMemo(() => CURRENCIES.filter((item) =>
    !normalizedQuery || `${item.code} ${item.name}`.toLowerCase().includes(normalizedQuery)
  ), [normalizedQuery]);
  useEffect(() => {
    if (!normalizedQuery) return;
    if (languages.length > 0) setExpandedSection("language");
    else if (currencies.length > 0) setExpandedSection("currency");
  }, [normalizedQuery, languages.length, currencies.length]);

  const save = async () => {
    setSaving(true);
    try {
      await saveProfilePreferences(preferences);
      setLanguage(preferences.language);
      Alert.alert(t("Preferences saved"), t("Your language and currency preferences were updated."), [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert(t("Unable to save"), t("Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppHeader title={t("Language & Currency")} showBack />
        <View style={styles.card}>
          <AccordionHeader
            title={`${t("Language")} (${LANGUAGES.length})`}
            summary={LANGUAGES.find((item) => item.code === preferences.language)?.label ?? preferences.language}
            expanded={expandedSection === "language"}
            onPress={() => setExpandedSection((section) => section === "language" ? "currency" : "language")}
          />
          {expandedSection === "language" && (
            <>
              <GlassInput label={t("Search languages")} value={query} onChangeText={setQuery} placeholder={t("Search by name or code")} autoCapitalize="none" />
              {languages.map((item, index) => (
                <Option key={item.code} label={item.label} detail={item.nativeLabel && item.nativeLabel !== item.label ? item.nativeLabel : item.code.toUpperCase()} selected={preferences.language === item.code} onPress={() => setPreferences((p) => ({ ...p, language: item.code }))} last={index === languages.length - 1} />
              ))}
              {languages.length === 0 && <Text style={styles.noResults}>{t("No language found.")}</Text>}
            </>
          )}
          <AccordionHeader
            title={`${t("Currency")} (${CURRENCIES.length})`}
            summary={CURRENCIES.find((item) => item.code === preferences.currency)?.code ?? preferences.currency}
            expanded={expandedSection === "currency"}
            onPress={() => setExpandedSection((section) => section === "currency" ? "language" : "currency")}
          />
          {expandedSection === "currency" && (
            <>
              <GlassInput label={t("Search currencies")} value={query} onChangeText={setQuery} placeholder={t("Search by name or code")} autoCapitalize="none" />
              {currencies.map((item, index) => (
                <Option key={item.code} label={`${item.code} — ${item.name}`} detail={item.symbol} selected={preferences.currency === item.code} onPress={() => setPreferences((p) => ({ ...p, currency: item.code }))} last={index === currencies.length - 1} />
              ))}
              {currencies.length === 0 && <Text style={styles.noResults}>{t("No currency found.")}</Text>}
            </>
          )}
        </View>
        <GlassButton title={t("Save preferences")} onPress={save} loading={saving} style={styles.button} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function AccordionHeader({ title, summary, expanded, onPress }: { title: string; summary: string; expanded: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.accordionHeader}>
      <View style={styles.accordionCopy}>
        <Text style={styles.heading}>{title}</Text>
        {!expanded && <Text style={styles.accordionSummary}>{summary}</Text>}
      </View>
      <Text style={styles.chevron}>{expanded ? "⌃" : "⌄"}</Text>
    </Pressable>
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
  accordionHeader: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border },
  accordionCopy: { flex: 1 },
  heading: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.xs },
  accordionSummary: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.sm },
  chevron: { color: colors.accent, fontSize: 24, paddingHorizontal: spacing.sm },
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