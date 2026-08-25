import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadProfilePreferences } from "./utils/localPreferences";

type SupportedLanguage = "en" | "fr";

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  fr: {
    Home: "Accueil",
    Pay: "Payer",
    Me: "Moi",
    Dashboard: "Tableau de bord",
    "Welcome back": "Bon retour",
    "Active Tontines": "Tontines actives",
    "See all": "Voir tout",
    "Upcoming Contributions": "Cotisations à venir",
    "Quick Actions": "Actions rapides",
    "New Tontine": "Nouvelle tontine",
    "Pay Now": "Payer maintenant",
    Alerts: "Alertes",
    Contributions: "Cotisations",
    "Manage your payments": "Gérez vos paiements",
    Upcoming: "À venir",
    History: "Historique",
    "No upcoming contributions": "Aucune cotisation à venir",
    "No payment history yet": "Aucun historique de paiement",
    Tontines: "Tontines",
    total: "au total",
    Amount: "Montant",
    Members: "Membres",
    Cycle: "Cycle",
    Started: "Commencée le",
    "No tontines yet": "Aucune tontine",
    "Create your first tontine and start building wealth together": "Créez votre première tontine et commencez à épargner ensemble",
    "Create Tontine": "Créer une tontine",
    Notifications: "Notifications",
    unread: "non lues",
    "Mark all read": "Tout marquer comme lu",
    "All caught up!": "Tout est à jour !",
    "You have no new notifications": "Vous n’avez aucune nouvelle notification",
    Profile: "Profil",
    Guest: "Invité",
    "Not signed in": "Non connecté",
    "Edit Profile": "Modifier le profil",
    "Change Password": "Modifier le mot de passe",
    "Notification Settings": "Paramètres des notifications",
    "Payment Methods": "Moyens de paiement",
    "Help & Support": "Aide et assistance",
    "Terms & Privacy": "Conditions et confidentialité",
    Logout: "Se déconnecter",
    Cancel: "Annuler",
    "Are you sure you want to logout?": "Voulez-vous vraiment vous déconnecter ?",
    "Language & Currency": "Langue et devise",
    Language: "Langue",
    Currency: "Devise",
    "Search languages": "Rechercher une langue",
    "Search currencies": "Rechercher une devise",
    "Search by name or code": "Rechercher par nom ou code",
    "No language found.": "Aucune langue trouvée.",
    "No currency found.": "Aucune devise trouvée.",
    "Save preferences": "Enregistrer les préférences",
    "Preferences saved": "Préférences enregistrées",
    "Your language and currency preferences were updated.": "Vos préférences de langue et de devise ont été mises à jour.",
    "Unable to save": "Impossible d’enregistrer",
    "Please try again.": "Veuillez réessayer.",
    "Save changes": "Enregistrer les modifications",
    "Profile updated": "Profil mis à jour",
    "Your profile has been saved.": "Votre profil a été enregistré.",
    "Full name": "Nom complet",
    "Email address": "Adresse e-mail",
    "Phone number": "Numéro de téléphone",
    "Keep your contact details up to date.": "Gardez vos coordonnées à jour.",
    "Your phone number is used as your secure account identifier.": "Votre numéro de téléphone est utilisé comme identifiant sécurisé de votre compte.",
    "Push notifications": "Notifications push",
    "Important updates about your account": "Informations importantes sur votre compte",
    "Contribution reminders": "Rappels de cotisation",
    "Reminders before a contribution is due": "Rappels avant l’échéance d’une cotisation",
    "Payout alerts": "Alertes de versement",
    "Know when a payout is ready": "Soyez informé lorsqu’un versement est disponible",
  },
};

interface I18nContextValue {
  language: string;
  t: (value: string) => string;
  setLanguage: (language: string) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: "en",
  t: (value) => value,
  setLanguage: () => undefined,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");

  useEffect(() => {
    void loadProfilePreferences().then((preferences) => setLanguageState(preferences.language));
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const activeLanguage: SupportedLanguage = language === "fr" ? "fr" : "en";
    return {
      language,
      t: (text) => translations[activeLanguage][text] ?? text,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
      },
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}