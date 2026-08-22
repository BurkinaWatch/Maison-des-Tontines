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
import { GlassCard, GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email address and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
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
          <Text style={styles.title}>Maison des Tontines</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        <GlassCard style={styles.card}>
          <View>
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
              placeholder="Your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              onSubmitEditing={handleLogin}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GlassButton
              title="Sign in"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.link}>Sign up</Text>
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
