import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { PaymentForm } from "../../src/components/forms/PaymentForm";
import { colors, spacing } from "../../src/theme";
import { api } from "../../src/services/api";
import { contributionService } from "../../src/services/contribution.service";
import type { PaymentMethod } from "../../src/types/contribution";

export default function PayContributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tontineId?: string; cycleId?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [cycle, setCycle] = useState<{ id: string; name: string; amount: number; currency: string } | null>(null);
  const [paymentState, setPaymentState] = useState<"ready" | "pending" | "checking" | "success" | "failed">("ready");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!params.tontineId) return;
    const loadCycle = async () => {
      try {
        if (params.cycleId) {
          const response = await api.get<{ cycle: { id: string; name: string; tontine: { contributionAmount: number; currency: string } } }>(
            `/cycles/${params.tontineId}/cycles/${params.cycleId}`
          );
          setCycle({ id: response.cycle.id, name: response.cycle.name, amount: response.cycle.tontine.contributionAmount, currency: response.cycle.tontine.currency });
          return;
        }
        const response = await api.get<{ cycles: Array<{ id: string; name: string; status: string; tontine: { contributionAmount: number; currency: string } }> }>(
          `/cycles/${params.tontineId}/cycles`
        );
        const current = response.cycles.find((item) => item.status === "ACTIVE") ?? response.cycles[0];
        if (current) setCycle({ id: current.id, name: current.name, amount: current.tontine.contributionAmount, currency: current.tontine.currency });
      } catch {
        setPaymentState("failed");
      }
    };
    void loadCycle();
  }, [params.tontineId, params.cycleId]);

  const handlePayment = async (method: PaymentMethod) => {
    if (!params.tontineId || !cycle || method !== "mobile_money") {
      Alert.alert("Mobile Money required", "Select Mobile Money to continue.");
      return;
    }
    setIsLoading(true);
    setPaymentState("pending");

    try {
      const result = await contributionService.initiatePayment({
        tontineId: params.tontineId,
        cycleId: cycle.id,
        method: "MOBILE_MONEY",
        phoneNumber: "",
        amount: cycle.amount,
      });
      setReference(result.payment.internalReference);
      setPaymentState("checking");
      for (let attempt = 0; attempt < 6; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const status = await contributionService.getPaymentStatus(result.payment.internalReference);
        if (["SUCCESS", "PAID", "COMPLETED"].includes(status.status.toUpperCase())) {
          setPaymentState("success");
          return;
        }
        if (["FAILED", "CANCELLED", "EXPIRED"].includes(status.status.toUpperCase())) {
          setPaymentState("failed");
          return;
        }
      }
      setPaymentState("pending");
    } catch (error) {
      setPaymentState("failed");
      Alert.alert("Payment unavailable", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <AppHeader title="Pay your contribution" showBack showProfile />
      <View style={styles.container}>
        {paymentState === "success" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>✅ Contribution paid</Text>
            <Text style={styles.stateText}>{cycle?.amount.toLocaleString()} {cycle?.currency}</Text>
            <Text style={styles.stateText}>Reference: {reference}</Text>
            <Text style={styles.stateText}>Cycle: {cycle?.name}</Text>
          </View>
        ) : paymentState === "pending" || paymentState === "checking" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>{paymentState === "checking" ? "Verifying payment…" : "Payment pending…"}</Text>
            <Text style={styles.stateText}>Do not close the app. The contribution will only be marked paid after server confirmation.</Text>
          </View>
        ) : (
          <PaymentForm
            contributionId={cycle?.id || ""}
            amount={cycle?.amount || 0}
            currency={cycle?.currency || "XOF"}
            onSubmit={handlePayment}
            isLoading={isLoading || !cycle}
          />
        )}
        {paymentState === "failed" && <Text style={styles.errorText}>❌ Payment did not go through. You can try again.</Text>}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  stateTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: "700" },
  stateText: { color: colors.textSecondary, fontSize: 15 },
  errorText: { color: colors.error, padding: spacing.md, textAlign: "center" },
});
