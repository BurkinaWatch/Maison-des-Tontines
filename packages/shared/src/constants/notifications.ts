export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

export enum NotificationType {
  CONTRIBUTION_DUE = 'CONTRIBUTION_DUE',
  CONTRIBUTION_RECEIVED = 'CONTRIBUTION_RECEIVED',
  PAYOUT_RECEIVED = 'PAYOUT_RECEIVED',
  TONTINE_INVITE = 'TONTINE_INVITE',
  VOTE_STARTED = 'VOTE_STARTED',
  VOTE_ENDED = 'VOTE_ENDED',
  CYCLE_STARTED = 'CYCLE_STARTED',
  CYCLE_ENDED = 'CYCLE_ENDED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  REMINDER = 'REMINDER',
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; body: string }> = {
  [NotificationType.CONTRIBUTION_DUE]: {
    title: 'Cotisation à venir',
    body: 'Votre cotisation de {amount} {currency} est due le {dueDate}.',
  },
  [NotificationType.CONTRIBUTION_RECEIVED]: {
    title: 'Cotisation reçue',
    body: 'Vous avez reçu {amount} {currency} de {senderName}.',
  },
  [NotificationType.PAYOUT_RECEIVED]: {
    title: 'Fonds reçus',
    body: 'Vous avez reçu {amount} {currency} de la tontine {tontineName}.',
  },
  [NotificationType.TONTINE_INVITE]: {
    title: 'Invitation à une tontine',
    body: '{inviterName} vous invite à rejoindre la tontine {tontineName}.',
  },
  [NotificationType.VOTE_STARTED]: {
    title: 'Vote en cours',
    body: 'Un vote a commencé pour la tontine {tontineName}.',
  },
  [NotificationType.VOTE_ENDED]: {
    title: 'Vote terminé',
    body: 'Le vote pour la tontine {tontineName} est terminé.',
  },
  [NotificationType.CYCLE_STARTED]: {
    title: 'Cycle commencé',
    body: 'Le cycle {cycleNumber} de la tontine {tontineName} a commencé.',
  },
  [NotificationType.CYCLE_ENDED]: {
    title: 'Cycle terminé',
    body: 'Le cycle {cycleNumber} de la tontine {tontineName} est terminé.',
  },
  [NotificationType.DISPUTE_RAISED]: {
    title: 'Litige ouvert',
    body: 'Un litige a été ouvert dans la tontine {tontineName}.',
  },
  [NotificationType.DISPUTE_RESOLVED]: {
    title: 'Litige résolu',
    body: 'Le litige dans la tontine {tontineName} a été résolu.',
  },
  [NotificationType.KYC_APPROVED]: {
    title: 'KYC approuvé',
    body: 'Votre vérification KYC a été approuvée.',
  },
  [NotificationType.KYC_REJECTED]: {
    title: 'KYC rejeté',
    body: 'Votre vérification KYC a été rejetée. Veuillez réessayer.',
  },
  [NotificationType.SYSTEM_ALERT]: {
    title: 'Alerte système',
    body: '{message}',
  },
  [NotificationType.REMINDER]: {
    title: 'Rappel',
    body: '{message}',
  },
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  [NotificationChannel.PUSH]: true,
  [NotificationChannel.SMS]: true,
  [NotificationChannel.EMAIL]: true,
  [NotificationChannel.IN_APP]: true,
};
