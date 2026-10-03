import React from "react";
import Constants from "expo-constants";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { BrandLogo } from "../../src/components/BrandLogo";
import { useI18n } from "../../src/i18n";
import { colors, spacing, typography } from "../../src/theme";

export default function AboutScreen() {
  const { t } = useI18n();
  const version = Constants.expoConfig?.version;

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="About" showBack />

        <View style={styles.brandFrame}>
          <BrandLogo
            variant="tagline"
            width={300}
            height={200}
            accessibilityLabel="La Maison des Tontines — épargner ensemble, s’entraider, grandir ensemble"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>{t("About this app")}</Text>
          <Text style={styles.body}>
            {t(
              "Maison des Tontines helps groups organize their savings circles, track contributions, and stay connected."
            )}
          </Text>
          <Text style={styles.tagline}>
            {t("Save together, help one another, grow together.")}
          </Text>
          {version ? (
            <Text style={styles.version}>{t("Version")} {version}</Text>
          ) : null}
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
    paddingBottom: spacing.xxxl,
  },
  brandFrame: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#f7f1e3",
    borderRadius: 18,
    margin: spacing.md,
    overflow: "hidden",
    padding: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  heading: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
});