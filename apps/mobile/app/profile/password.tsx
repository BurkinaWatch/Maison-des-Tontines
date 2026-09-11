import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton, GlassInput } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { authService } from "../../src/services/auth.service";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!currentPassword) return setError("Enter your current password.");
    if (newPassword.length < 8) return setError("The new password must contain at least 8 characters.");
    if (newPassword !== confirmation) return setError("The passwords do not match.");
    setError("");
    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert("Password changed", "Your password was updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Change Password" showBack />
        <View style={styles.card}>
          <Text style={styles.help}>Use a unique password with at least 8 characters.</Text>
          <GlassInput label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" />
          <GlassInput label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" />
          <GlassInput label="Confirm new password" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <GlassButton title="Update password" onPress={save} loading={saving} />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  help: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
});