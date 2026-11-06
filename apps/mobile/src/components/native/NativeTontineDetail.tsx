import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import type { Cycle, Tontine, TontineMember } from "../../types/tontine";
import type { TontineUpdateRequest } from "../../services/tontine.service";

type Props = {
  tontine: Tontine;
  cycles: Cycle[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  inviting: boolean;
  canManage: boolean;
  canDelete: boolean;
  managingMember: boolean;
  error: string;
  onBack: () => void;
  onRefresh: () => void;
  onSave: (data: TontineUpdateRequest) => Promise<void>;
  onDelete: () => void;
  onInvite: (target: string) => Promise<void>;
  onUpdateMemberRole: (memberId: string, role: "MEMBER" | "TREASURER") => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
};

const palette = {
  accent: "#d4a574",
  background: "#0a0a14",
  card: "#1a1a2e",
  input: "#30303a",
  muted: "rgba(255,255,255,0.68)",
  white: "#ffffff",
  error: "#ffb4ad",
};

export function NativeTontineDetail({
  tontine,
  cycles,
  loading,
  saving,
  deleting,
  inviting,
  canManage,
  canDelete,
  managingMember,
  error,
  onBack,
  onRefresh,
  onSave,
  onDelete,
  onInvite,
  onUpdateMemberRole,
  onRemoveMember,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tontine.name);
  const [description, setDescription] = useState(tontine.description);
  const [maxMembers, setMaxMembers] = useState(String(tontine.totalMembers));
  const [inviteTarget, setInviteTarget] = useState("");

  useEffect(() => {
    setName(tontine.name);
    setDescription(tontine.description);
    setMaxMembers(String(tontine.totalMembers));
  }, [tontine.id, tontine.name, tontine.description, tontine.totalMembers]);

  const submitChanges = async () => {
    const parsedMaxMembers = Number(maxMembers);
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert("Nom invalide", "Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (!Number.isInteger(parsedMaxMembers) || parsedMaxMembers < 2) {
      Alert.alert("Nombre de membres invalide", "Saisis un nombre entier d’au moins 2.");
      return;
    }
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        maxMembers: parsedMaxMembers,
      });
      setEditing(false);
    } catch {
      // The parent keeps the form open and displays the API error.
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer la tontine",
      "Cette action est définitive. Les données associées seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: onDelete },
      ],
    );
  };

  const submitInvite = async () => {
    const target = inviteTarget.trim();
    if (!target) return;
    try {
      await onInvite(target);
      setInviteTarget("");
    } catch {
      // Keep the target so the user can correct it or retry.
    }
  };

  const confirmRemoveMember = (member: TontineMember) => {
    Alert.alert(
      "Retirer ce membre",
      `Retirer ${member.name} de cette tontine ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: () => void onRemoveMember(member.id).catch(() => undefined),
        },
      ],
    );
  };

  const chooseMemberRole = (member: TontineMember) => {
    Alert.alert("Modifier le rôle", member.name, [
      { text: "Membre", onPress: () => void onUpdateMemberRole(member.id, "MEMBER").catch(() => undefined) },
      { text: "Trésorier", onPress: () => void onUpdateMemberRole(member.id, "TREASURER").catch(() => undefined) },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.link}>‹  Mes tontines</Text>
      </Pressable>

      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{tontine.name}</Text>
          <Text style={styles.muted}>{tontine.type} · {tontine.frequency}</Text>
        </View>
        <Text style={styles.status}>{tontine.status}</Text>
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Détails</Text>
        <InfoRow label="Contribution" value={formatMoney(tontine.amount, tontine.currency)} />
        <InfoRow label="Membres" value={`${tontine.members.length} / ${tontine.totalMembers}`} />
        <InfoRow label="Cycles" value={`${tontine.currentCycle} / ${tontine.totalCycles}`} />
        <InfoRow label="Début" value={formatDate(tontine.startDate)} />
        {!!tontine.description && <Text style={styles.description}>{tontine.description}</Text>}
        {loading ? <Text style={styles.muted}>Actualisation…</Text> : null}
        <Pressable accessibilityRole="button" onPress={onRefresh} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Actualiser</Text>
        </Pressable>
      </View>

      {canManage ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gestion</Text>
          {editing ? (
            <>
              <NativeField label="Nom" value={name} onChangeText={setName} />
              <NativeField label="Description" value={description} onChangeText={setDescription} multiline />
              <NativeField label="Nombre maximum de membres" value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" />
              <View style={styles.buttonRow}>
                <ActionButton title="Annuler" variant="secondary" onPress={() => setEditing(false)} />
                <ActionButton title={saving ? "Enregistrement…" : "Enregistrer"} disabled={saving} onPress={() => void submitChanges()} />
              </View>
            </>
          ) : (
            <ActionButton title="Modifier la tontine" onPress={() => setEditing(true)} />
          )}

          <Text style={[styles.sectionTitle, styles.memberSectionTitle]}>Inviter un membre</Text>
          <NativeField
            label="E-mail ou téléphone"
            value={inviteTarget}
            onChangeText={setInviteTarget}
            placeholder="+221… ou nom@exemple.com"
          />
          <ActionButton
            title={inviting ? "Envoi…" : "Envoyer une invitation"}
            disabled={inviting || !inviteTarget.trim()}
            onPress={() => void submitInvite()}
          />
          {canDelete ? (
            <Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>{deleting ? "Suppression…" : "Supprimer la tontine"}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Membres ({tontine.members.length})</Text>
        {tontine.members.length ? tontine.members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberText}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.muted}>{member.phoneNumber || member.email || "Coordonnées non disponibles"}</Text>
              <Text style={styles.memberRole}>{member.role || "MEMBRE"}{member.status ? ` · ${member.status}` : ""}</Text>
            </View>
            {canManage && member.role !== "ORGANIZER" ? (
              <View style={styles.memberActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={managingMember}
                  onPress={() => chooseMemberRole(member)}
                  style={styles.memberActionButton}
                >
                  <Text style={styles.memberActionText}>{managingMember ? "…" : "Rôle"}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={managingMember}
                  onPress={() => confirmRemoveMember(member)}
                  style={styles.memberActionButton}
                >
                  <Text style={styles.removeText}>{managingMember ? "…" : "Retirer"}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )) : <Text style={styles.muted}>Aucun membre affiché.</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cycles ({cycles.length})</Text>
        {cycles.length ? cycles.map((cycle) => (
          <View key={cycle.id} style={styles.cycleRow}>
            <View style={styles.memberText}>
              <Text style={styles.memberName}>Cycle {cycle.cycleNumber}</Text>
              <Text style={styles.muted}>{formatDate(cycle.startDate)} · {cycle.status}</Text>
            </View>
            <Text style={styles.memberRole}>{formatMoney(cycle.potAmount, tontine.currency)}</Text>
          </View>
        )) : <Text style={styles.muted}>Aucun cycle disponible pour le moment.</Text>}
      </View>
    </View>
  );
}

function NativeField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.42)"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  title,
  onPress,
  disabled,
  variant,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "secondary";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButton, variant === "secondary" && styles.secondaryButton, disabled && styles.disabled]}
    >
      <Text style={[styles.actionButtonText, variant === "secondary" && styles.secondaryButtonText]}>{title}</Text>
    </Pressable>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
}

const styles = {
  backButton: { alignSelf: "flex-start" as const, marginBottom: 14, paddingVertical: 8 },
  link: { color: palette.accent, fontSize: 14, fontWeight: "700" as const },
  heading: { alignItems: "center" as const, flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 14 },
  headingText: { flex: 1, marginRight: 10 },
  title: { color: palette.white, fontSize: 21, fontWeight: "700" as const },
  status: { color: palette.accent, fontSize: 12, fontWeight: "700" as const, textTransform: "capitalize" as const },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  error: { backgroundColor: "rgba(255,120,110,0.12)", borderColor: "rgba(255,180,173,0.35)", borderRadius: 10, borderWidth: 1, color: palette.error, marginBottom: 12, padding: 12 },
  card: { backgroundColor: palette.card, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 16 },
  sectionTitle: { color: palette.white, fontSize: 17, fontWeight: "700" as const, marginBottom: 10 },
  infoRow: { alignItems: "center" as const, borderBottomColor: "rgba(255,255,255,0.08)", borderBottomWidth: 1, flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 9 },
  infoValue: { color: palette.white, fontSize: 13, fontWeight: "600" as const },
  description: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 10 },
  secondaryButton: { alignItems: "center" as const, borderColor: "rgba(212,165,116,0.45)", borderRadius: 10, borderWidth: 1, justifyContent: "center" as const, marginTop: 10, minHeight: 42, paddingHorizontal: 14 },
  secondaryButtonText: { color: palette.accent, fontSize: 13, fontWeight: "700" as const },
  memberSectionTitle: { marginTop: 18 },
  field: { marginBottom: 10 },
  fieldLabel: { color: palette.muted, fontSize: 12, fontWeight: "600" as const, marginBottom: 6 },
  input: { backgroundColor: palette.input, borderColor: "rgba(255,255,255,0.12)", borderRadius: 10, borderWidth: 1, color: palette.white, fontSize: 15, minHeight: 46, paddingHorizontal: 12 },
  multilineInput: { minHeight: 76, paddingTop: 10, textAlignVertical: "top" as const },
  buttonRow: { flexDirection: "row" as const, gap: 10 },
  actionButton: { alignItems: "center" as const, backgroundColor: palette.accent, borderRadius: 10, flex: 1, justifyContent: "center" as const, marginTop: 8, minHeight: 44, paddingHorizontal: 12 },
  actionButtonText: { color: palette.background, fontSize: 13, fontWeight: "700" as const },
  disabled: { opacity: 0.55 },
  deleteButton: { alignItems: "center" as const, marginTop: 16, padding: 12 },
  deleteText: { color: palette.error, fontSize: 13, fontWeight: "700" as const },
  memberRow: { alignItems: "center" as const, borderTopColor: "rgba(255,255,255,0.08)", borderTopWidth: 1, flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 10 },
  cycleRow: { alignItems: "center" as const, borderTopColor: "rgba(255,255,255,0.08)", borderTopWidth: 1, flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 10 },
  memberText: { flex: 1, marginRight: 8 },
  memberName: { color: palette.white, fontSize: 14, fontWeight: "600" as const },
  memberRole: { color: palette.accent, fontSize: 11, fontWeight: "700" as const },
  memberActions: { flexDirection: "row" as const, gap: 6, marginTop: 6 },
  memberActionButton: { borderColor: "rgba(212,165,116,0.4)", borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  memberActionText: { color: palette.accent, fontSize: 11, fontWeight: "700" as const },
  removeText: { color: palette.error, fontSize: 11, fontWeight: "700" as const },
};
