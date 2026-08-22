import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { GlassCard, GlassInput, GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { authService } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authService.requestOTP(email.trim());

      setIsOtpSent(true);
      Alert.alert(
        "OTP Sent",
        result.developmentOtp
          ? `Development code: ${result.developmentOtp}`
          : "Check your email for the verification code"
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Impossible d’envoyer le code. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email.trim(), otp.trim());
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
          <Text style={styles.subtitle}>
            {isOtpSent ? "Enter verification code" : "Welcome back"}
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {!isOtpSent ? (
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
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GlassButton
                title="Send verification code"
                onPress={handleRequestOTP}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={colors.textTertiary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <Text style={styles.hint}>
                Sent to {email}
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GlassButton
                title="Verify & Login"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.button}
              />
              <Pressable onPress={() => setIsOtpSent(false)}>
                <Text style={styles.link}>Change email address</Text>
              </Pressable>
            </View>
          )}
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
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
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
