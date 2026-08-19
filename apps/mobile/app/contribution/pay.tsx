import React, { useState } from "react";
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

export default function PayContributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tontineId?: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (method: string) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Success", "Payment initiated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <AppHeader title="Make Payment" showBack showProfile />
      <View style={styles.container}>
        <PaymentForm
          contributionId={params.tontineId || "demo"}
          amount={50000}
          currency="FCFA"
          onSubmit={handlePayment}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
