import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { GlassCard, GlassInput, GlassButton } from "../ui";
import { colors, spacing, typography } from "../../theme";
import { PaymentMethod } from "../../types/contribution";
import { useI18n } from "../../i18n";

interface PaymentFormProps {
  contributionId: string;
  amount: number;
  currency: string;
  onSubmit: (method: PaymentMethod, phoneNumber: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  contributionId,
  amount,
  currency,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods: { value: PaymentMethod; label: string; emoji: string; description: string }[] = [
    { value: "mobile_money", label: t("Mobile Money"), emoji: "📱", description: t("Pay via MoMo, Orange Money") },
    { value: "bank_transfer", label: t("Bank Transfer"), emoji: "🏦", description: t("Direct bank transfer") },
    { value: "cash", label: t("Cash"), emoji: "💵", description: t("Mark as paid manually") },
    { value: "card", label: t("Card"), emoji: "💳", description: t("Debit or credit card") },
  ];

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedMethod, phoneNumber);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("Make Payment")}</Text>
      <GlassCard style={styles.amountCard}>
        <Text style={styles.amountLabel}>{t("Amount Due")}</Text>
        <Text style={styles.amountValue}>
          {amount.toLocaleString()} {currency}
        </Text>
      </GlassCard>

      <Text style={styles.label}>{t("Select Payment Method")}</Text>
      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <Pressable
            key={method.value}
            onPress={() => setSelectedMethod(method.value)}
            style={[
              styles.methodCard,
              selectedMethod === method.value && styles.methodCardActive,
            ]}
          >
            <Text style={styles.methodEmoji}>{method.emoji}</Text>
            <View style={styles.methodInfo}>
              <Text
                style={[
                  styles.methodLabel,
                  selectedMethod === method.value && styles.methodLabelActive,
                ]}
              >
                {method.label}
              </Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === method.value && styles.radioActive,
              ]}
            >
              {selectedMethod === method.value && (
                <View style={styles.radioInner} />
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {selectedMethod === "mobile_money" && (
        <GlassInput
          label={t("Phone Number")}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+225 01 00 00 00"
          keyboardType="phone-pad"
        />
      )}

      <View style={styles.buttonRow}>
        {onCancel && (
          <GlassButton
            title={t("Cancel")}
            onPress={onCancel}
            variant="secondary"
            style={styles.button}
          />
        )}
        <GlassButton
          title={t("Pay Now")}
          onPress={handleSubmit}
          loading={isSubmitting || isLoading}
          disabled={!selectedMethod}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  amountCard: {
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountValue: {
    ...typography.display,
    color: colors.accent,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  methodsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  methodCardActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  methodEmoji: {
    fontSize: 28,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  methodLabelActive: {
    color: colors.accent,
  },
  methodDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
});
