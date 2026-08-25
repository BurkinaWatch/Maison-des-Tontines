import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../../src/components/layout";
import { AppHeader } from "../../../src/components/layout/AppHeader";
import { GlassCard, MemberAvatar, StatusBadge, EmptyState, GlassButton } from "../../../src/components/ui";
import { colors, spacing, typography } from "../../../src/theme";
import { useTontineStore } from "../../../src/store/tontineStore";
import { useAuthStore } from "../../../src/store/authStore";
import { TontineMember } from "../../../src/types/tontine";
import { useI18n } from "../../../src/i18n";

export default function MembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { members, fetchMembers, isLoading, inviteMember, removeMember, updateMemberRole } = useTontineStore();
  const user = useAuthStore((state) => state.user);
  const { t } = useI18n();
  const [target, setTarget] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const canManage = members.some((member) =>
    member.userId === user?.id && (member.role === "ORGANIZER" || member.role === "ADMIN")
  );

  useEffect(() => {
    if (params.id) {
      fetchMembers(params.id);
    }
  }, [params.id]);

  const handleRemoveMember = (member: TontineMember) => {
    Alert.alert(
      t("Remove Member"),
      `${t("Are you sure you want to remove this member?")} ${member.name}?`,
      [
        { text: t("Cancel"), style: "cancel" },
         { text: t("Remove"), style: "destructive", onPress: async () => {
           try { await removeMember(params.id, member.id); }
           catch (error) { Alert.alert(t("Error"), (error as Error).message); }
         } },
      ]
    );
  };

  const handleInvite = async () => {
    const value = target.trim();
    if (!value) return;
    setInviteLoading(true);
    try {
      const isEmail = value.includes("@");
      await inviteMember(params.id, isEmail ? { email: value } : { phone: value });
      setTarget("");
      setShowInvite(false);
      Alert.alert(t("Success"), t("Invitation sent"));
      await fetchMembers(params.id);
    } catch (error) {
      Alert.alert(t("Error"), (error as Error).message);
    } finally { setInviteLoading(false); }
  };

  const handleRole = (member: TontineMember) => {
    Alert.alert(t("Update role"), member.name, [
      { text: t("Member"), onPress: () => updateMemberRole(params.id, member.id, "MEMBER").catch((e) => Alert.alert(t("Error"), e.message)) },
      { text: t("Treasurer"), onPress: () => updateMemberRole(params.id, member.id, "TREASURER").catch((e) => Alert.alert(t("Error"), e.message)) },
      { text: t("Cancel"), style: "cancel" },
    ]);
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchMembers(params.id)} />
        }
      >
        <AppHeader
          title={t("Members")}
          subtitle={`${members.length} ${t("members")}`}
          showBack
          showProfile
        />

        <View style={styles.content}>
          {canManage && (
            <View style={styles.inviteSection}>
              {!showInvite ? (
                <GlassButton title={t("Invite member")} onPress={() => setShowInvite(true)} />
              ) : (
                <GlassCard>
                  <Text style={styles.formLabel}>{t("Phone number or email")}</Text>
                  <TextInput
                    value={target}
                    onChangeText={setTarget}
                    placeholder="+221... or name@example.com"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                  />
                  <View style={styles.formActions}>
                    <GlassButton title={t("Cancel")} variant="secondary" onPress={() => setShowInvite(false)} style={styles.formButton} />
                    <GlassButton title={t("Send invitation")} onPress={handleInvite} loading={inviteLoading} disabled={!target.trim()} style={styles.formButton} />
                  </View>
                </GlassCard>
              )}
            </View>
          )}
          {members.length > 0 ? (
            members.map((member: TontineMember) => (
              <GlassCard key={member.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <MemberAvatar
                    name={member.name}
                    avatarUrl={member.avatarUrl}
                    size="medium"
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPhone}>{member.phoneNumber}</Text>
                    <Text style={styles.memberPosition}>{member.role || t("Member")} · {member.status || "ACTIVE"}</Text>
                    <Text style={styles.memberPosition}>
                      {member.contributions?.filter((item) => item.status === "PAID").length || 0} {t("paid contributions")}
                    </Text>
                  </View>
                </View>
                <View style={styles.memberFooter}>
                  <StatusBadge status={(member.status || "ACTIVE").toLowerCase()} />
                  {canManage && member.role !== "ORGANIZER" && (
                    <View style={styles.memberActions}>
                      <Pressable onPress={() => handleRole(member)} style={styles.roleButton}>
                        <Text style={styles.roleText}>{t("Role")}</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRemoveMember(member)} style={styles.removeButton}>
                        <Text style={styles.removeText}>{t("Remove")}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState
              icon="👥"
              title={t("No members yet")}
              description={t("Members will appear here once they join the tontine")}
            />
          )}
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
  memberCard: {
    marginBottom: spacing.sm,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  memberPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberPosition: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  memberFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inviteSection: {
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  memberActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  roleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: `${colors.accent}20`,
  },
  roleText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "600",
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: `${colors.error}20`,
  },
  removeText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: "600",
  },
});
