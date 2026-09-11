import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { GlassCard, GlassInput, GlassButton } from "../ui";
import { colors, spacing, typography, borderRadius } from "../../theme";
import { TontineType, TontineRules } from "../../types/tontine";
import { createTontineSchema } from "../../utils/validation";
import { useI18n } from "../../i18n";

interface CreateTontineFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTontineForm: React.FC<CreateTontineFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "rotating" as TontineType,
    amount: "",
    currency: "XOF",
    frequency: "monthly",
    totalMembers: "5",
    totalCycles: "5",
    startDate: "",
    rules: {
      allowLatePayment: true,
      latePenaltyPercent: 5,
      requireVoteForAbsent: true,
      maxMissedContributions: 2,
      payoutDelayDays: 1,
      allowEarlyPayout: true,
      earlyPayoutPenalty: 10,
    } as TontineRules,
    members: [],
    categoryDetails: {
      payoutOrder: "organizer-first",
      savingsTarget: "",
      savingsTargetDate: "",
      allowEarlyWithdrawal: false,
      investmentProject: "",
      investmentTarget: "",
      investmentRisk: "medium",
      investmentDuration: "",
      profitSharing: "",
      socialAidType: "emergency",
      socialBeneficiary: "",
      socialUrgency: "normal",
      socialTarget: "",
    },
  });
  const [formError, setFormError] = useState("");

  const tontineTypes: { value: TontineType; label: string; emoji: string }[] = [
    { value: "rotating", label: t("Rotating"), emoji: "🔄" },
    { value: "savings", label: t("Savings"), emoji: "🏦" },
    { value: "investment", label: t("Investment"), emoji: "📈" },
    { value: "social", label: t("Social"), emoji: "🤝" },
  ];

  const frequencies = ["weekly", "biweekly", "monthly", "quarterly"];

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const parsed = createTontineSchema.safeParse({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      frequency: formData.frequency,
      totalMembers: parseInt(formData.totalMembers, 10),
      totalCycles: parseInt(formData.totalCycles, 10),
      startDate: formData.startDate,
      rules: formData.rules,
      members: [{ phoneNumber: "+00000000000", name: "Organizer", position: 1 }, { phoneNumber: "+00000000001", name: "Member", position: 2 }],
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? t("Please complete all required fields."));
      return;
    }
    setFormError("");
    try {
      const typeMap: Record<TontineType, "ROTATIVE" | "SAVINGS" | "GOAL" | "HYBRID"> = {
        rotating: "ROTATIVE",
        savings: "SAVINGS",
        investment: "GOAL",
        social: "HYBRID",
      };
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: typeMap[formData.type],
        contributionAmount: parseFloat(formData.amount),
        currency: formData.currency,
        frequency: formData.frequency,
        maxMembers: parseInt(formData.totalMembers, 10),
        startDate: new Date(`${formData.startDate}T00:00:00.000Z`).toISOString(),
        rules: { ...formData.rules, ...formData.categoryDetails, totalCycles: parseInt(formData.totalCycles, 10) },
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const renderCategoryFields = () => {
    const setDetail = (field: string, value: string | boolean) =>
      setFormData((previous) => ({ ...previous, categoryDetails: { ...previous.categoryDetails, [field]: value } }));
    if (formData.type === "rotating") {
      return (
        <>
          <Text style={styles.categoryHint}>{t("Members receive the pot in a defined rotation.")}</Text>
          <Text style={styles.label}>{t("First beneficiary")}</Text>
          <View style={styles.choiceRow}>
            {["organizer-first", "draw", "vote"].map((value) => (
              <Pressable key={value} onPress={() => setDetail("payoutOrder", value)} style={[styles.choice, formData.categoryDetails.payoutOrder === value && styles.choiceActive]}>
                <Text style={[styles.choiceText, formData.categoryDetails.payoutOrder === value && styles.choiceTextActive]}>{value === "organizer-first" ? t("Organizer") : value === "draw" ? t("Random draw") : t("Member vote")}</Text>
              </Pressable>
            ))}
          </View>
        </>
      );
    }
    if (formData.type === "savings") {
      return (
        <>
          <Text style={styles.categoryHint}>{t("Set a shared target and the date when it should be reached.")}</Text>
          <GlassInput label={t("Savings target")} value={String(formData.categoryDetails.savingsTarget)} onChangeText={(value) => setDetail("savingsTarget", value)} keyboardType="numeric" placeholder="e.g. 500000" />
          <GlassInput label={t("Target date")} value={String(formData.categoryDetails.savingsTargetDate)} onChangeText={(value) => setDetail("savingsTargetDate", value)} placeholder="YYYY-MM-DD" />
          <Toggle label={t("Allow early withdrawal")} value={Boolean(formData.categoryDetails.allowEarlyWithdrawal)} onChange={(value) => setDetail("allowEarlyWithdrawal", value)} />
        </>
      );
    }
    if (formData.type === "investment") {
      return (
        <>
          <Text style={styles.categoryHint}>{t("Describe the project and how members share its risk and returns.")}</Text>
          <GlassInput label={t("Investment project")} value={String(formData.categoryDetails.investmentProject)} onChangeText={(value) => setDetail("investmentProject", value)} placeholder={t("e.g. Community shop")} />
          <GlassInput label={t("Funding target")} value={String(formData.categoryDetails.investmentTarget)} onChangeText={(value) => setDetail("investmentTarget", value)} keyboardType="numeric" placeholder="e.g. 2000000" />
          <Text style={styles.label}>{t("Risk level")}</Text>
          <View style={styles.choiceRow}>{["low", "medium", "high"].map((value) => <Pressable key={value} onPress={() => setDetail("investmentRisk", value)} style={[styles.choice, formData.categoryDetails.investmentRisk === value && styles.choiceActive]}><Text style={[styles.choiceText, formData.categoryDetails.investmentRisk === value && styles.choiceTextActive]}>{value.toUpperCase()}</Text></Pressable>)}</View>
          <GlassInput label={t("Duration (months)")} value={String(formData.categoryDetails.investmentDuration)} onChangeText={(value) => setDetail("investmentDuration", value)} keyboardType="numeric" />
          <GlassInput label={t("Profit sharing rule")} value={String(formData.categoryDetails.profitSharing)} onChangeText={(value) => setDetail("profitSharing", value)} placeholder={t("e.g. Pro-rata to contributions")} />
        </>
      );
    }
    return (
      <>
        <Text style={styles.categoryHint}>{t("Define who receives help and how urgent the request is.")}</Text>
        <GlassInput label={t("Type of aid")} value={String(formData.categoryDetails.socialAidType)} onChangeText={(value) => setDetail("socialAidType", value)} placeholder={t("e.g. Medical, education, emergency")} />
        <GlassInput label={t("Beneficiary")} value={String(formData.categoryDetails.socialBeneficiary)} onChangeText={(value) => setDetail("socialBeneficiary", value)} placeholder={t("Name of beneficiary")} />
        <Text style={styles.label}>{t("Urgency")}</Text>
        <View style={styles.choiceRow}>{["low", "normal", "urgent"].map((value) => <Pressable key={value} onPress={() => setDetail("socialUrgency", value)} style={[styles.choice, formData.categoryDetails.socialUrgency === value && styles.choiceActive]}><Text style={[styles.choiceText, formData.categoryDetails.socialUrgency === value && styles.choiceTextActive]}>{value.toUpperCase()}</Text></Pressable>)}</View>
        <GlassInput label={t("Aid target")} value={String(formData.categoryDetails.socialTarget)} onChangeText={(value) => setDetail("socialTarget", value)} keyboardType="numeric" />
      </>
    );
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) => (
    <View style={styles.ruleItem}>
      <Text style={styles.ruleLabel}>{label}</Text>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={() => onChange(!value)}
        style={[styles.toggle, value && styles.toggleActive]}
      >
        <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
      </Pressable>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s <= step && styles.stepActive,
            s === step && styles.stepCurrent,
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {renderStepIndicator()}
      <Text style={styles.title}>{t("Create Tontine")}</Text>

      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Basic Information")}</Text>
          <GlassInput
            label={t("Tontine Name")}
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            placeholder={t("Enter tontine name")}
          />
          <GlassInput
            label={t("Description")}
            value={formData.description}
            onChangeText={(text) => updateField("description", text)}
            placeholder={t("Describe the purpose")}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>{t("Type")}</Text>
          <View style={styles.typeGrid}>
            {tontineTypes.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => updateField("type", type.value)}
                style={[
                  styles.typeCard,
                  formData.type === type.value && styles.typeCardActive,
                ]}
              >
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    formData.type === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Configuration</Text>
          {renderCategoryFields()}
          <Text style={styles.sectionTitle}>{t("Contribution settings")}</Text>
          <GlassInput
            label={t("Amount per Cycle")}
            value={formData.amount}
            onChangeText={(text) => updateField("amount", text)}
            placeholder="0"
            keyboardType="numeric"
          />
          <GlassInput
            label={t("Currency")}
            value={formData.currency}
            onChangeText={(text) => updateField("currency", text)}
            placeholder="XOF"
          />
          <Text style={styles.label}>{t("Frequency")}</Text>
          <View style={styles.frequencyContainer}>
            {frequencies.map((freq) => (
              <Pressable
                key={freq}
                onPress={() => updateField("frequency", freq)}
                style={[
                  styles.frequencyButton,
                  formData.frequency === freq && styles.frequencyActive,
                ]}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    formData.frequency === freq && styles.frequencyActiveText,
                  ]}
                >
                  {t(freq)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Members & Cycles")}</Text>
          <GlassInput
            label={t("Total Members")}
            value={formData.totalMembers}
            onChangeText={(text) => updateField("totalMembers", text)}
            keyboardType="numeric"
          />
          <GlassInput
            label={t("Total Cycles")}
            value={formData.totalCycles}
            onChangeText={(text) => updateField("totalCycles", text)}
            keyboardType="numeric"
          />
          <GlassInput
            label={t("Start Date")}
            value={formData.startDate}
            onChangeText={(text) => updateField("startDate", text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
      )}

      {step === 4 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Rules Configuration")}</Text>
          <View style={styles.rulesContainer}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>{t("Allow Late Payment")}</Text>
              <Pressable
                onPress={() =>
                  updateField("rules", {
                    ...formData.rules,
                    allowLatePayment: !formData.rules.allowLatePayment,
                  })
                }
                style={[
                  styles.toggle,
                  formData.rules.allowLatePayment && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formData.rules.allowLatePayment && styles.toggleKnobActive,
                  ]}
                />
              </Pressable>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>{t("Require Vote for Absent")}</Text>
              <Pressable
                onPress={() =>
                  updateField("rules", {
                    ...formData.rules,
                    requireVoteForAbsent: !formData.rules.requireVoteForAbsent,
                  })
                }
                style={[
                  styles.toggle,
                  formData.rules.requireVoteForAbsent && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formData.rules.requireVoteForAbsent && styles.toggleKnobActive,
                  ]}
                />
              </Pressable>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>{t("Allow Early Payout")}</Text>
              <Pressable
                onPress={() =>
                  updateField("rules", {
                    ...formData.rules,
                    allowEarlyPayout: !formData.rules.allowEarlyPayout,
                  })
                }
                style={[
                  styles.toggle,
                  formData.rules.allowEarlyPayout && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formData.rules.allowEarlyPayout && styles.toggleKnobActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {step === 5 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Review & Confirm")}</Text>
          <GlassCard>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Name")}</Text>
              <Text style={styles.reviewValue}>{formData.name || "—"}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Type")}</Text>
              <Text style={styles.reviewValue}>
                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Amount")}</Text>
              <Text style={styles.reviewValue}>
                {formData.amount ? `${parseFloat(formData.amount).toLocaleString()} ${formData.currency}` : "—"}
              </Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Frequency")}</Text>
              <Text style={styles.reviewValue}>
                {formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)}
              </Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Members")}</Text>
              <Text style={styles.reviewValue}>
                {formData.totalMembers} ({formData.totalCycles} {t("cycles")})
              </Text>
            </View>
          </GlassCard>
        </View>
      )}

      <View style={styles.buttonRow}>
        {step > 1 && (
          <GlassButton
            title={t("Back")}
            onPress={() => setStep(step - 1)}
            variant="secondary"
            style={styles.button}
          />
        )}
        {step < 5 ? (
          <GlassButton
            title={t("Next")}
            onPress={() => setStep(step + 1)}
            style={styles.button}
          />
        ) : (
          <GlassButton
            title={t("Create Tontine")}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />
        )}
      </View>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  stepActive: {
    backgroundColor: colors.accent,
  },
  stepCurrent: {
    width: 24,
  },
  stepContent: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  categoryHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choice: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}15`,
  },
  choiceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  choiceTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  formError: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    minWidth: "45%",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  typeCardActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}15`,
  },
  typeEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  typeLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  typeLabelActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  frequencyActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}15`,
  },
  frequencyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  frequencyActiveText: {
    color: colors.accent,
    fontWeight: "600",
  },
  rulesContainer: {
    gap: spacing.md,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  ruleLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceDark,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  toggleKnobActive: {
    backgroundColor: colors.primary,
    transform: [{ translateX: 20 }],
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reviewValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
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
