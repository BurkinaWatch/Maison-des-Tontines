export const TONTINE_STATUS_LABELS: Record<string, string> = {
  [TontineStatus.DRAFT]: 'Brouillon',
  [TontineStatus.ACTIVE]: 'Active',
  [TontineStatus.COMPLETED]: 'Terminée',
  [TontineStatus.CANCELLED]: 'Annulée',
  [TontineStatus.SUSPENDED]: 'Suspendue',
};

export const CYCLE_STATUS_LABELS: Record<string, string> = {
  [CycleStatus.UPCOMING]: 'À venir',
  [CycleStatus.ACTIVE]: 'En cours',
  [CycleStatus.COMPLETED]: 'Terminé',
  [CycleStatus.CANCELLED]: 'Annulé',
};

export const CONTRIBUTION_STATUS_LABELS: Record<string, string> = {
  [ContributionStatus.PENDING]: 'En attente',
  [ContributionStatus.CONFIRMED]: 'Confirmé',
  [ContributionStatus.OVERDUE]: 'En retard',
  [ContributionStatus.LATE]: 'En retard',
  [ContributionStatus.PARTIAL]: 'Partiel',
  [ContributionStatus.WAIVED]: 'Exonéré',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.PROCESSING]: 'En cours',
  [PaymentStatus.COMPLETED]: 'Complété',
  [PaymentStatus.FAILED]: 'Échoué',
  [PaymentStatus.CANCELLED]: 'Annulé',
  [PaymentStatus.REFUNDED]: 'Remboursé',
};

export const VOTE_STATUS_LABELS: Record<string, string> = {
  [VoteStatus.PENDING]: 'En attente',
  [VoteStatus.ACTIVE]: 'En cours',
  [VoteStatus.COMPLETED]: 'Terminé',
  [VoteStatus.CANCELLED]: 'Annulé',
};

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  [DisputeStatus.OPEN]: 'Ouvert',
  [DisputeStatus.IN_REVIEW]: 'En révision',
  [DisputeStatus.RESOLVED]: 'Résolu',
  [DisputeStatus.CLOSED]: 'Fermé',
};

export const DISPUTE_TYPE_LABELS: Record<string, string> = {
  [DisputeType.MISSING_PAYMENT]: 'Paiement manquant',
  [DisputeType.LATE_PAYMENT]: 'Paiement en retard',
  [DisputeType.RULE_VIOLATION]: 'Violation de règle',
  [DisputeType.MEMBER_CONFLICT]: 'Conflit entre membres',
  [DisputeType.TECHNICAL_ISSUE]: 'Problème technique',
  [DisputeType.OTHER]: 'Autre',
};

export const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  [ContributionType.REGULAR]: 'Régulier',
  [ContributionType.LATE]: 'En retard',
  [ContributionType.PENALTY]: 'Pénalité',
  [ContributionType.ADJUSTMENT]: 'Ajustement',
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  [PaymentType.CONTRIBUTION]: 'Cotisation',
  [PaymentType.PAYOUT]: 'Distribution',
  [PaymentType.PENALTY]: 'Pénalité',
  [PaymentType.REFUND]: 'Remboursement',
  [PaymentType.FEE]: 'Frais',
};

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  [MemberRole.ADMIN]: 'Administrateur',
  [MemberRole.TREASURER]: 'Trésorier',
  [MemberRole.MEMBER]: 'Membre',
};

export const TONTINE_TYPE_LABELS: Record<string, string> = {
  [TontineType.ROTATING]: 'Rotative',
  [TontineType.SAVINGS]: 'Épargne',
  [TontineType.LOTTERY]: 'Tontine loterie',
  [TontineType.CUSTOM]: 'Personnalisée',
};
