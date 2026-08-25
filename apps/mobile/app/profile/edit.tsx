import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(`${user.firstName} ${user.lastName}`.trim());
    setEmail(user.email ?? "");
  }, [user]);

  const initialName = useMemo(
    () => (user ? `${user.firstName} ${user.lastName}`.trim() : ""),
    [user]
  );
  const initialEmail = user?.email ?? "";
  const hasChanges = name.trim() !== initialName || email.trim().toLowerCase() !== initialEmail.toLowerCase();

  const save = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    setError("");
    setNameError("");
    setEmailError("");
    if (cleanName.length < 2) {
      setNameError("Enter at least 2 characters.");
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
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
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AppHeader title="Edit Profile" showBack />
          <View style={styles.card}>
            <Text style={styles.help}>Keep your contact details up to date.</Text>
            <GlassInput
              label="Full name"
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (nameError) setNameError("");
              }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              error={nameError}
            />
            <GlassInput
              label="Email address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              error={emailError}
            />
            <GlassInput
              label="Phone number"
              value={user?.phoneNumber ?? ""}
              editable={false}
              selectTextOnFocus={false}
              inputStyle={styles.readOnlyInput}
            />
            <Text style={styles.readOnlyHint}>
              Your phone number is used as your secure account identifier.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GlassButton
              title="Save changes"
              onPress={save}
              loading={saving}
              disabled={!user || !hasChanges}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  card: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  help: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  readOnlyInput: { color: colors.textSecondary },
  readOnlyHint: { ...typography.caption, color: colors.textTertiary, marginTop: -spacing.sm, marginBottom: spacing.md },
});