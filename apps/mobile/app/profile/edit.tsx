import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton, GlassInput } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return setError("Please enter your full name.");
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return setError("Please enter a valid email address.");
    }
    setError("");
    setSaving(true);
    try {
      await updateProfile({ name: cleanName, email: cleanEmail || null });
      Alert.alert("Profile updated", "Your profile has been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader title="Edit Profile" showBack />
        <View style={styles.card}>
          <Text style={styles.help}>Keep your contact details up to date.</Text>
          <GlassInput label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
          <GlassInput label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <GlassInput label="Phone number" value={user?.phoneNumber ?? ""} editable={false} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <GlassButton title="Save changes" onPress={save} loading={saving} />
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