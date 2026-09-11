import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { GlassButton, GlassInput } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme";
import { useAuthStore } from "../../src/store/authStore";
import {
  CreatePaymentMethodInput,
  PaymentMethod,
  PaymentMethodType,
  paymentMethodService,
} from "../../src/services/payment-method.service";

const providerOptions = ["Wave", "Orange Money", "MTN Mobile Money", "Moov Money"];

export default function PaymentMethodsScreen() {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<PaymentMethodType>("MOBILE_MONEY");
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState(providerOptions[0]);
  const [phone, setPhone] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [fieldError, setFieldError] = useState("");

  const loadMethods = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setMethods(await paymentMethodService.list());
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payment methods.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMethods();
  }, [loadMethods]);

  const resetForm = () => {
    setLabel("");
    setProvider(providerOptions[0]);
    setPhone("");
    setCardBrand("");
    setCardNumber("");
    setFieldError("");
  };

  const save = async () => {
    const cleanLabel = label.trim();
    if (cleanLabel.length < 2) return setFieldError("Give this payment method a name.");
    if (type === "MOBILE_MONEY" && !/^\+?\d[\d\s-]{7,14}$/.test(phone.trim())) {
      return setFieldError("Enter a valid mobile money phone number.");
    }
    const digits = cardNumber.replace(/\D/g, "");
    if (type === "CARD" && (digits.length < 12 || digits.length > 19)) {
      return setFieldError("Enter a valid card number.");
    }
    if (type === "CARD" && cardBrand.trim().length < 2) {
      return setFieldError("Enter the card brand.");
    }

    const input: CreatePaymentMethodInput =
      type === "MOBILE_MONEY"
        ? { type, label: cleanLabel, provider: provider.trim(), phone: phone.trim() }
        : { type, label: cleanLabel, cardBrand: cardBrand.trim(), cardNumber: digits };

    setSaving(true);
    setFieldError("");
    try {
      const created = await paymentMethodService.create(input);
      setMethods((current) => [created, ...current]);
      setShowForm(false);
      resetForm();
    } catch (saveError) {
      setFieldError(saveError instanceof Error ? saveError.message : "Unable to save this payment method.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (method: PaymentMethod) => {
    Alert.alert("Remove payment method", `Remove ${method.label}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await paymentMethodService.remove(method.id);
            setMethods((current) => current.filter((item) => item.id !== method.id));
          } catch (removeError) {
            setError(removeError instanceof Error ? removeError.message : "Unable to remove this payment method.");
          }
        },
      },
    ]);
  };

  if (!user && isAuthLoading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>
      </SafeAreaWrapper>
    );
  }

  if (!user) {
    return (
      <SafeAreaWrapper>
        <AppHeader title="Payment Methods" showBack />
        <View style={styles.card}>
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.description}>Sign in to manage your payment methods.</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader title="Payment Methods" showBack />
          <View style={styles.intro}>
            <Text style={styles.icon}>💳</Text>
            <Text style={styles.title}>Your payment methods</Text>
            <Text style={styles.description}>Only masked details are stored. Never share your PIN, CVV or full card number.</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <ActivityIndicator color={colors.accent} /> : methods.length > 0 ? (
            <View style={styles.list}>
              {methods.map((method) => (
                <View key={method.id} style={styles.methodCard}>
                  <Text style={styles.methodIcon}>{method.type === "CARD" ? "💳" : "📱"}</Text>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodLabel}>{method.label}</Text>
                    <Text style={styles.methodValue}>
                      {method.type === "CARD" ? `${method.cardBrand} · ` : `${method.provider} · `}
                      {method.maskedValue}
                    </Text>
                  </View>
                  <Pressable onPress={() => remove(method)} hitSlop={10}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No payment method added</Text>
              <Text style={styles.description}>Add one to make contributions faster.</Text>
            </View>
          )}

          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add payment method</Text>
              <View style={styles.typeRow}>
                {(["MOBILE_MONEY", "CARD"] as PaymentMethodType[]).map((item) => (
                  <Pressable key={item} onPress={() => { setType(item); setFieldError(""); }} style={[styles.typeOption, type === item && styles.typeOptionActive]}>
                    <Text style={[styles.typeText, type === item && styles.typeTextActive]}>{item === "CARD" ? "Card" : "Mobile Money"}</Text>
                  </Pressable>
                ))}
              </View>
              <GlassInput label="Name" placeholder="e.g. My main account" value={label} onChangeText={setLabel} autoCapitalize="words" />
              {type === "MOBILE_MONEY" ? (
                <>
                  <Text style={styles.fieldLabel}>Provider</Text>
                  <View style={styles.providerRow}>
                    {providerOptions.map((item) => <Pressable key={item} onPress={() => setProvider(item)} style={[styles.provider, provider === item && styles.providerActive]}><Text style={styles.providerText}>{item}</Text></Pressable>)}
                  </View>
                  <GlassInput label="Phone number" placeholder="+225 01 02 03 04 05" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </>
              ) : (
                <>
                  <GlassInput label="Card brand" placeholder="Visa or Mastercard" value={cardBrand} onChangeText={setCardBrand} autoCapitalize="words" />
                  <GlassInput label="Card number" placeholder="•••• •••• •••• ••••" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" secureTextEntry />
                </>
              )}
              {fieldError ? <Text style={styles.error}>{fieldError}</Text> : null}
              <View style={styles.actions}>
                <GlassButton title="Cancel" variant="secondary" onPress={() => { setShowForm(false); resetForm(); }} style={styles.action} />
                <GlassButton title="Save method" onPress={save} loading={saving} style={styles.action} />
              </View>
            </View>
          ) : (
            <GlassButton title="Add payment method" onPress={() => setShowForm(true)} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxxl },
  intro: { alignItems: "center", marginBottom: spacing.lg },
  icon: { fontSize: 44, marginBottom: spacing.sm },
  card: { margin: spacing.md, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  title: { ...typography.heading3, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, textAlign: "center", lineHeight: 22 },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.md, textAlign: "center" },
  list: { gap: spacing.sm, marginBottom: spacing.lg },
  methodCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  methodIcon: { fontSize: 26 },
  methodInfo: { flex: 1 },
  methodLabel: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  methodValue: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  remove: { ...typography.caption, color: colors.error },
  emptyCard: { padding: spacing.lg, alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  emptyTitle: { ...typography.body, color: colors.textPrimary, fontWeight: "600", marginBottom: spacing.xs },
  formCard: { marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  formTitle: { ...typography.heading3, color: colors.textPrimary, marginBottom: spacing.md },
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  typeOption: { flex: 1, padding: spacing.sm, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  typeOptionActive: { borderColor: colors.accent, backgroundColor: `${colors.accent}18` },
  typeText: { ...typography.caption, color: colors.textSecondary },
  typeTextActive: { color: colors.accent, fontWeight: "600" },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  providerRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md },
  provider: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  providerActive: { borderColor: colors.accent },
  providerText: { ...typography.caption, color: colors.textSecondary },
  actions: { flexDirection: "row", gap: spacing.sm },
  action: { flex: 1 },
});