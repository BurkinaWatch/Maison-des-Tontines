import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { GlassButton } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { authService } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/authStore";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const login = useAuthStore((state) => state.login);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(params.email || "", otp.trim());
      router.replace("/(tabs)");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setCountdown(60);

    try {
      await authService.requestOTP(params.email || "");

      Alert.alert("Code resent", "Check your email for the new code");
    } catch {
      Alert.alert("Error", "Failed to resend OTP");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Verify email</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to {params.email || "your email address"}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const newOtp = otp.split("");
                newOtp[index] = text;
                setOtp(newOtp.join(""));

              }}
              value={otp[index] || ""}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <GlassButton
          title="Verify"
          onPress={handleVerifyOTP}
          loading={isLoading}
          disabled={otp.length !== 6}
          style={styles.button}
        />

        <View style={styles.resendContainer}>
          {canResend ? (
            <Pressable onPress={handleResendOTP}>
              <Text style={styles.resendText}>Resend code</Text>
            </Pressable>
          ) : (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          )}
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
    marginBottom: spacing.xxl,
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
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpInput: {
    flex: 1,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  button: {
    marginBottom: spacing.lg,
  },
  resendContainer: {
    alignItems: "center",
  },
  resendText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
  countdownText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
