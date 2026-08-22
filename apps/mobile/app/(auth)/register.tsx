import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { GlassCard, GlassInput, GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!phoneNumber.trim() || !email.trim() || !firstName.trim() || !lastName.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register(
        phoneNumber.trim(),
        email.trim(),
        firstName.trim(),
        lastName.trim(),
        password
      );
      router.replace("/(tabs)");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Maison des Tontines
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <View>
            <GlassInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
              autoCapitalize="words"
            />
            <GlassInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Dupont"
              autoCapitalize="words"
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+225 01 00 00 00"
              placeholderTextColor={colors.textTertiary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="vous@exemple.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              onSubmitEditing={handleRegister}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GlassButton
              title="Create account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Pressable onPress={() => router.back()}>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
  link: {
    ...typography.bodySmall,
    color: colors.accent,
    textAlign: "center",
    marginTop: spacing.md,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
