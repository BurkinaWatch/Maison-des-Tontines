import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { EmptyState, GlassButton, GlassCard } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useTontineStore } from "../../src/store/tontineStore";
import { useI18n } from "../../src/i18n";

export default function InvitationsScreen() {
  const { invitations, fetchInvitations, respondToInvitation } = useTontineStore();
  const { t } = useI18n();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { fetchInvitations().catch(() => undefined); }, []);

  const respond = async (id: string, decision: "ACCEPT" | "DECLINE") => {
    setBusyId(id);
    try {
      await respondToInvitation(id, decision);
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
    } finally { setBusyId(null); }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container}>
        <AppHeader title={t("Tontine invitations")} showBack showProfile />
        <View style={styles.content}>
          {invitations.length === 0 ? (
            <EmptyState icon="✉️" title={t("No invitations")} description={t("New tontine invitations will appear here")} />
          ) : invitations.map((invitation) => (
            <GlassCard key={invitation.id} style={styles.card}>
              <Text style={styles.title}>{invitation.tontine.name}</Text>
              <Text style={styles.details}>
                {t("Contribution")}: {invitation.tontine.contributionAmount} {invitation.tontine.currency}
              </Text>
              <View style={styles.actions}>
                <GlassButton title={t("Decline")} variant="secondary" onPress={() => respond(invitation.id, "DECLINE")} loading={busyId === invitation.id} style={styles.button} />
                <GlassButton title={t("Accept")} onPress={() => respond(invitation.id, "ACCEPT")} loading={busyId === invitation.id} style={styles.button} />
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.md },
  title: { ...typography.heading3, color: colors.textPrimary, marginBottom: spacing.xs },
  details: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm },
  button: { flex: 1 },
});