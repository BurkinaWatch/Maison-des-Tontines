import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { colors, spacing, typography } from "../theme";

type SotyssiBrandingProps = {
  variant?: "footer" | "compact";
};

export function SotyssiBranding({
  variant = "footer",
}: SotyssiBrandingProps) {
  const { t } = useI18n();
  const isFooter = variant === "footer";

  return (
    <View
      accessibilityLabel={t("A product of SOTYSSI")}
      style={[styles.container, isFooter && styles.footer]}
    >
      <View style={styles.brandRow}>
        <View
          style={[
            styles.logoFrame,
            isFooter ? styles.footerLogoFrame : styles.compactLogoFrame,
          ]}
        >
          <Image
            accessible
            accessibilityLabel={t("SOTYSSI emblem and wordmark")}
            accessibilityRole="image"
            resizeMode="contain"
            source={require("../../assets/sotyssi-brand.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.relationship}>{t("A product of SOTYSSI")}</Text>
          <Text style={styles.signature}>
            {t("We build what connects")}
          </Text>
        </View>
      </View>
      {isFooter && (
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} {t("Maison des Tontines. A SOTYSSI product.")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  footer: {
    alignItems: "stretch",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.md,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    maxWidth: 420,
    width: "100%",
  },
  logoFrame: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 7,
    flexShrink: 0,
    justifyContent: "center",
    overflow: "hidden",
    padding: 3,
  },
  footerLogoFrame: {
    height: 82,
    width: 86,
  },
  compactLogoFrame: {
    height: 94,
    width: 98,
  },
  logo: {
    height: "100%",
    width: "100%",
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  relationship: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  signature: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  copyright: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
