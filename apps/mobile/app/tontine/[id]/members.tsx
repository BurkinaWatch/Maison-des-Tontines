import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../../src/components/layout";
import { AppHeader } from "../../../src/components/layout/AppHeader";
import { GlassCard, MemberAvatar, StatusBadge, EmptyState } from "../../../src/components/ui";
import { colors, spacing, typography } from "../../../src/theme";
import { useTontineStore } from "../../../src/store/tontineStore";
import { TontineMember } from "../../../src/types/tontine";

export default function MembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { members, fetchMembers, isLoading } = useTontineStore();

  useEffect(() => {
    if (params.id) {
      fetchMembers(params.id);
    }
  }, [params.id]);

  const handleRemoveMember = (member: TontineMember) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive" },
      ]
    );
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
          title="Members"
          subtitle={`${members.length} members`}
          showBack
          showProfile
        />

        <View style={styles.content}>
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
                    <Text style={styles.memberPosition}>
                      Position: {member.position}
                    </Text>
                  </View>
                </View>
                <View style={styles.memberFooter}>
                  <StatusBadge status="active" />
                  <Pressable
                    onPress={() => handleRemoveMember(member)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState
              icon="👥"
              title="No members yet"
              description="Members will appear here once they join the tontine"
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
