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

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });

      setIsOtpSent(true);
      Alert.alert("OTP Sent", "Check your phone for the verification code");
    } catch {
      setError("Failed to send OTP. Please try again.");
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
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: phoneNumber.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: phoneNumber.trim(),
            otp: otp.trim(),
          }),
        });

        router.replace("/(tabs)/");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Login failed. Please try again.");
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
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GlassButton
                title="Send OTP"
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
                Sent to {phoneNumber}
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GlassButton
                title="Verify & Login"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.button}
              />
              <Pressable onPress={() => setIsOtpSent(false)}>
                <Text style={styles.link}>Change phone number</Text>
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
