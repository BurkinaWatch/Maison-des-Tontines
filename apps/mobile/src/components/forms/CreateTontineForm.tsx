import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { GlassCard, GlassInput, GlassButton } from "../ui";
import { colors, spacing, typography, borderRadius } from "../../theme";
import { TontineType, TontineRules } from "../../types/tontine";
import {
  createTontineSchema,
  getTontineCategoryError,
  isValidDateOnly,
  parseTontineAmount,
} from "../../utils/validation";
import { CURRENCIES as CURRENCY_OPTIONS } from "../../utils/profileOptions";
import { useI18n } from "../../i18n";

const TONTINE_CURRENCY_CODES = new Set([
  "XOF", "XAF", "GNF", "NGN", "GHS", "KES", "UGX", "TZS", "RWF", "BIF",
  "MRU", "USD", "EUR", "GBP",
]);
const TONTINE_CURRENCIES = CURRENCY_OPTIONS.filter(({ code }) =>
  TONTINE_CURRENCY_CODES.has(code)
);

interface CreateTontineFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTontineForm: React.FC<CreateTontineFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "rotating" as TontineType,
    amount: "",
    currency: "XOF",
    frequency: "monthly",
    totalMembers: "5",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tontineTypes: { value: TontineType; label: string; emoji: string; description: string }[] = [
    { value: "rotating", label: t("Rotating"), emoji: "🔄", description: t("Members contribute regularly and receive the pot in turn.") },
    { value: "savings", label: t("Savings"), emoji: "🏦", description: t("Build a shared savings target by a chosen date.") },
    { value: "investment", label: t("Investment"), emoji: "📈", description: t("Fund a project with a defined risk and profit-sharing plan.") },
    { value: "social", label: t("Social"), emoji: "🤝", description: t("Collect support for a named beneficiary and specific need.") },
  ];

  const frequencies = ["weekly", "biweekly", "monthly", "quarterly"];

  const goToNextStep = () => {
    if (step === 1) {
      if (formData.name.trim().length < 3 || formData.name.trim().length > 100) {
        setFormError(t("Enter a tontine name between 3 and 100 characters."));
        return;
      }
      if (formData.description.length > 500) {
        setFormError(t("Description must be less than 500 characters."));
        return;
      }
    }
    if (step === 2) {
      const amount = parseTontineAmount(formData.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
        setFormError(t("Enter a positive contribution amount below 100,000,000."));
        return;
      }
      const categoryError = getTontineCategoryError(formData.type, formData.categoryDetails);
      if (categoryError) {
        setFormError(t(categoryError));
        return;
      }
    }
    if (step === 3) {
      const members = Number(formData.totalMembers);
      if (!Number.isInteger(members) || members < 2 || members > 50) {
        setFormError(t("Choose between 2 and 50 members."));
        return;
      }
      if (!isValidDateOnly(formData.startDate)) {
        setFormError(t("Enter the start date in YYYY-MM-DD format."));
        return;
      }
      const categoryError = getTontineCategoryError(
        formData.type,
        formData.categoryDetails,
        formData.startDate,
      );
      if (categoryError) {
        setFormError(t(categoryError));
        return;
      }
    }
    setFormError("");
    setStep((current) => current + 1);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || isLoading) {
      return;
    }

    const categoryError = getTontineCategoryError(
      formData.type,
      formData.categoryDetails,
      formData.startDate,
    );
    if (categoryError) {
      setFormError(t(categoryError));
      setStep(2);
      return;
    }

    const amount = parseTontineAmount(formData.amount);
    const parsed = createTontineSchema.safeParse({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      amount,
      currency: formData.currency,
      frequency: formData.frequency,
      totalMembers: parseInt(formData.totalMembers, 10),
      totalCycles: parseInt(formData.totalMembers, 10),
      startDate: formData.startDate,
      rules: formData.rules,
      members: [{ phoneNumber: "+00000000000", name: "Organizer", position: 1 }, { phoneNumber: "+00000000001", name: "Member", position: 2 }],
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = String(issue?.path[0] ?? "");
      if (["name", "description", "type"].includes(field)) setStep(1);
      else if (["amount", "currency", "frequency"].includes(field)) setStep(2);
      else if (["totalMembers", "totalCycles", "startDate"].includes(field)) setStep(3);
      else setStep(4);
      setFormError(issue?.message ?? t("Please complete all required fields."));
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const typeMap: Record<TontineType, "ROTATIVE" | "SAVINGS" | "GOAL" | "HYBRID"> = {
        rotating: "ROTATIVE",
        savings: "SAVINGS",
        investment: "GOAL",
        social: "HYBRID",
      };
      const memberCount = parseInt(formData.totalMembers, 10);
      const startDate = new Date(`${formData.startDate}T00:00:00.000Z`);
      const endDate =
        formData.type === "savings"
          ? new Date(`${formData.categoryDetails.savingsTargetDate}T00:00:00.000Z`)
          : formData.type === "investment"
            ? addUtcMonths(startDate, parseInt(formData.categoryDetails.investmentDuration, 10))
            : undefined;
      const categoryRules: Record<TontineType, Record<string, string | number | boolean>> = {
        rotating: {
          payoutOrder: formData.categoryDetails.payoutOrder,
          requireVoteForAbsent: formData.rules.requireVoteForAbsent,
          allowEarlyPayout: formData.rules.allowEarlyPayout,
          payoutDelayDays: formData.rules.payoutDelayDays,
          earlyPayoutPenalty: formData.rules.earlyPayoutPenalty,
        },
        savings: {
          savingsTarget: parseTontineAmount(formData.categoryDetails.savingsTarget),
          savingsTargetDate: formData.categoryDetails.savingsTargetDate,
          allowEarlyWithdrawal: Boolean(formData.categoryDetails.allowEarlyWithdrawal),
        },
        investment: {
          investmentProject: formData.categoryDetails.investmentProject.trim(),
          investmentTarget: parseTontineAmount(formData.categoryDetails.investmentTarget),
          investmentRisk: formData.categoryDetails.investmentRisk,
          investmentDuration: parseInt(formData.categoryDetails.investmentDuration, 10),
          profitSharing: formData.categoryDetails.profitSharing.trim(),
        },
        social: {
          socialAidType: formData.categoryDetails.socialAidType.trim(),
          socialBeneficiary: formData.categoryDetails.socialBeneficiary.trim(),
          socialUrgency: formData.categoryDetails.socialUrgency,
          socialTarget: parseTontineAmount(formData.categoryDetails.socialTarget),
        },
      };
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: typeMap[formData.type],
        contributionAmount: amount,
        currency: parsed.data.currency,
        frequency: formData.frequency,
        maxMembers: parseInt(formData.totalMembers, 10),
        startDate: startDate.toISOString(),
        ...(endDate ? { endDate: endDate.toISOString() } : {}),
        rules: {
          allowLatePayment: formData.rules.allowLatePayment,
          latePenaltyPercent: formData.rules.latePenaltyPercent,
          maxMissedContributions: formData.rules.maxMissedContributions,
          ...categoryRules[formData.type],
          totalCycles: memberCount,
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : t("Unable to create tontine. Please try again.");
      setFormError(message);
    } finally {
      setIsSubmitting(false);
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
      {[1, 2, 3, 4].map((s) => (
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
                onPress={() => {
                  updateField("type", type.value);
                  setFormError("");
                }}
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
          <Text style={styles.categoryHint}>
            {tontineTypes.find((type) => type.value === formData.type)?.description}
          </Text>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Configure")} {t(formData.type === "rotating" ? "Rotating" : formData.type === "savings" ? "Savings" : formData.type === "investment" ? "Investment" : "Social")}</Text>
          {renderCategoryFields()}
          <Text style={styles.sectionTitle}>{t("Contribution settings")}</Text>
          <GlassInput
            label={t("Amount per Cycle")}
            value={formData.amount}
            onChangeText={(text) => updateField("amount", text)}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.label}>{t("Currency")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("Currency")}: ${formData.currency}`}
            onPress={() => setIsCurrencyPickerOpen((open) => !open)}
            style={styles.currencySelector}
          >
            <Text style={styles.currencySelectorText}>
              {TONTINE_CURRENCIES.find(({ code }) => code === formData.currency)?.code ?? formData.currency}
              {" — "}
              {TONTINE_CURRENCIES.find(({ code }) => code === formData.currency)?.name ?? ""}
            </Text>
            <Text style={styles.currencySelectorArrow}>
              {isCurrencyPickerOpen ? "▲" : "▼"}
            </Text>
          </Pressable>
          {isCurrencyPickerOpen && (
            <ScrollView
              nestedScrollEnabled
              style={styles.currencyOptions}
              keyboardShouldPersistTaps="handled"
            >
              {TONTINE_CURRENCIES.map((currency) => (
                <Pressable
                  key={currency.code}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: formData.currency === currency.code }}
                  onPress={() => {
                    updateField("currency", currency.code);
                    setIsCurrencyPickerOpen(false);
                    setFormError("");
                  }}
                  style={[
                    styles.currencyOption,
                    formData.currency === currency.code && styles.currencyOptionSelected,
                  ]}
                >
                  <Text style={styles.currencyOptionText}>
                    {currency.code} — {currency.name} ({currency.symbol})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
          <Text style={styles.sectionTitle}>{t("Rules for this plan")}</Text>
          <View style={styles.rulesContainer}>
            <Toggle
              label={t("Allow Late Payment")}
              value={formData.rules.allowLatePayment}
              onChange={(value) => updateField("rules", { ...formData.rules, allowLatePayment: value })}
            />
            {formData.type === "rotating" && (
              <>
                <Toggle
                  label={t("Require Vote for Absent")}
                  value={formData.rules.requireVoteForAbsent}
                  onChange={(value) => updateField("rules", { ...formData.rules, requireVoteForAbsent: value })}
                />
                <Toggle
                  label={t("Allow Early Payout")}
                  value={formData.rules.allowEarlyPayout}
                  onChange={(value) => updateField("rules", { ...formData.rules, allowEarlyPayout: value })}
                />
              </>
            )}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{t("Participants & Schedule")}</Text>
          <Text style={styles.categoryHint}>
            {t(formData.type === "rotating" ? "A rotation includes one payout cycle per member." : formData.type === "savings" ? "Set when contributions begin; the target date is set in the savings plan." : formData.type === "investment" ? "Set when the project contributions begin; duration is defined in the project plan." : "Set when the community collection begins.")}
          </Text>
          <GlassInput
            label={t("Total Members")}
            value={formData.totalMembers}
            onChangeText={(text) => updateField("totalMembers", text)}
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
          <Text style={styles.stepTitle}>{t("Review & Confirm")}</Text>
          <GlassCard>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Name")}</Text>
              <Text style={styles.reviewValue}>{formData.name || "—"}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Type")}</Text>
              <Text style={styles.reviewValue}>
                {tontineTypes.find((type) => type.value === formData.type)?.label}
              </Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Contribution per period")}</Text>
              <Text style={styles.reviewValue}>
                {Number.isFinite(parseTontineAmount(formData.amount))
                  ? `${parseTontineAmount(formData.amount).toLocaleString()} ${formData.currency}`
                  : "—"}
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
                {formData.totalMembers}
              </Text>
            </View>
            {getCategoryReview(formData.type, formData.categoryDetails, formData.currency, t).map(
              ({ label, value }) => (
                <View key={label} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{label}</Text>
                  <Text style={styles.reviewValue}>{value}</Text>
                </View>
              ),
            )}
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{t("Start Date")}</Text>
              <Text style={styles.reviewValue}>{formData.startDate || "—"}</Text>
            </View>
          </GlassCard>
        </View>
      )}

      {formError ? (
        <Text style={styles.formError} accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}
      <View style={styles.buttonRow}>
        {step > 1 && (
          <GlassButton
            title={t("Back")}
            onPress={() => {
              setFormError("");
              setStep(step - 1);
            }}
            variant="secondary"
            style={styles.button}
          />
        )}
        {step < 4 ? (
          <GlassButton
            title={t("Next")}
            onPress={goToNextStep}
            style={styles.button}
          />
        ) : (
          <GlassButton
            title={t("Create Tontine")}
            onPress={handleSubmit}
            loading={isLoading || isSubmitting}
            style={styles.button}
          />
        )}
      </View>
    </ScrollView>
  );
};

type CategoryDetails = {
  payoutOrder: string;
  savingsTarget: string;
  savingsTargetDate: string;
  allowEarlyWithdrawal: boolean;
  investmentProject: string;
  investmentTarget: string;
  investmentRisk: string;
  investmentDuration: string;
  profitSharing: string;
  socialAidType: string;
  socialBeneficiary: string;
  socialUrgency: string;
  socialTarget: string;
};

function addUtcMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const dayOfMonth = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDayOfMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));
  return result;
}

function getCategoryReview(
  type: TontineType,
  details: CategoryDetails,
  currency: string,
  t: (key: string) => string,
): { label: string; value: string }[] {
  const formatAmount = (amount: string) => {
    const parsed = parseTontineAmount(amount);
    return Number.isFinite(parsed) ? `${parsed.toLocaleString()} ${currency}` : "—";
  };

  if (type === "rotating") {
    const orderLabels: Record<string, string> = {
      "organizer-first": t("Organizer"),
      draw: t("Random draw"),
      vote: t("Member vote"),
    };
    return [{ label: t("First beneficiary"), value: orderLabels[details.payoutOrder] }];
  }

  if (type === "savings") {
    return [
      { label: t("Savings target"), value: formatAmount(details.savingsTarget) },
      { label: t("Target date"), value: details.savingsTargetDate || "—" },
      {
        label: t("Allow early withdrawal"),
        value: details.allowEarlyWithdrawal ? t("Yes") : t("No"),
      },
    ];
  }

  if (type === "investment") {
    return [
      { label: t("Investment project"), value: details.investmentProject || "—" },
      { label: t("Funding target"), value: formatAmount(details.investmentTarget) },
      { label: t("Risk level"), value: t(details.investmentRisk) },
      { label: t("Duration (months)"), value: details.investmentDuration || "—" },
      { label: t("Profit sharing rule"), value: details.profitSharing || "—" },
    ];
  }

  return [
    { label: t("Type of aid"), value: details.socialAidType || "—" },
    { label: t("Beneficiary"), value: details.socialBeneficiary || "—" },
    { label: t("Urgency"), value: t(details.socialUrgency) },
    { label: t("Aid target"), value: formatAmount(details.socialTarget) },
  ];
}

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
  currencySelector: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySelectorText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  currencySelectorArrow: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  currencyOptions: {
    maxHeight: 200,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  currencyOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  currencyOptionSelected: {
    backgroundColor: `${colors.accent}20`,
  },
  currencyOptionText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
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
