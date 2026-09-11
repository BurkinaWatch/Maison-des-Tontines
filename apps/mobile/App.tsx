import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authService } from "./src/services/auth.service";
import { contributionService } from "./src/services/contribution.service";
import { notificationService, type Notification } from "./src/services/notification.service";
import { tontineService } from "./src/services/tontine.service";
import type { Contribution } from "./src/types/contribution";
import type { Tontine } from "./src/types/tontine";
import type { User } from "./src/types/user";

type Screen = "login" | "register";
type AuthenticatedTab =
  | "dashboard"
  | "tontines"
  | "contributions"
  | "notifications"
  | "profile";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Authenticated app render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorScreen}>
            <Text style={styles.logo}>⚠️</Text>
            <Text style={styles.errorTitle}>L’application a rencontré un problème</Text>
            <Text style={styles.errorText}>
              La connexion a réussi, mais l’écran suivant n’a pas pu être affiché.
            </Text>
            <Text style={styles.errorDetails}>{this.state.error.message}</Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.name === "AbortError"
      ? "Le serveur ne répond pas. Vérifie ta connexion et réessaie."
      : error.message;
  }
  return fallback;
}

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedName, setConnectedName] = useState<string | null>(null);
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const isRegistering = screen === "register";

  async function handleLogin() {
    if (!email.trim() || !password) {
      setMessage("Saisis ton e-mail et ton mot de passe.");
      return;
    }
    setIsSubmitting(true);
    setMessage("Connexion en cours…");
    try {
      const { user } = await authService.login({ email: email.trim(), password });
      setConnectedUser(user);
      setConnectedName(user.firstName || user.email || "Membre");
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error, "La connexion a échoué. Réessaie."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !email.trim() || !password) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }
    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setIsSubmitting(true);
    setMessage("Création du compte en cours…");
    try {
      const { user } = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
      });
      setConnectedUser(user);
      setConnectedName(user.firstName || user.email || "Membre");
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error, "La création du compte a échoué. Réessaie."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    try {
      await authService.logout();
      setConnectedUser(null);
      setConnectedName(null);
      setPassword("");
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error, "La déconnexion a échoué."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submit = isRegistering ? handleRegister : handleLogin;

  if (connectedUser) {
    return (
      <AuthenticatedScreen
        name={connectedName || connectedUser.firstName || "Membre"}
        user={connectedUser}
        isSubmitting={isSubmitting}
        message={message}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {isRegistering && (
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => {
                  setMessage("");
                  setScreen("login");
                }}
                style={styles.nativeBackButton}
              >
                <Text style={styles.nativeBackButtonText}>← Retour à la connexion</Text>
              </Pressable>
            )}
            <Text style={styles.logo}>🏠</Text>
            <Text style={styles.title}>
              {connectedName ? `Bienvenue, ${connectedName}` : "Maison des Tontines"}
            </Text>
            <Text style={styles.subtitle}>
              {connectedName
                ? "Ton espace est prêt."
                : isRegistering
                  ? "Crée ton compte pour rejoindre la communauté"
                  : "Connecte-toi à ton compte"}
            </Text>

            <>
                {isRegistering && (
                  <>
                    <Field label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Votre prénom" />
                    <Field label="Nom" value={lastName} onChangeText={setLastName} placeholder="Votre nom" />
                    <Field label="Numéro de téléphone" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+225 01 02 03 04 05" keyboardType="phone-pad" />
                  </>
                )}
                <Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="vous@exemple.com" keyboardType="email-address" />
                <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder={isRegistering ? "8 caractères minimum" : "Votre mot de passe"} secureTextEntry />
                {isRegistering && (
                  <Field label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Répétez votre mot de passe" secureTextEntry />
                )}
                {message ? <Text style={[styles.message, isSubmitting ? styles.info : styles.error]}>{message}</Text> : null}
                <Pressable disabled={isSubmitting} onPress={submit} style={[styles.button, isSubmitting && styles.disabled]}>
                  {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>{isRegistering ? "Créer mon compte" : "Se connecter"}</Text>}
                </Pressable>
                <View style={styles.accountPrompt}>
                  <Text style={styles.accountText}>{isRegistering ? "Tu as déjà un compte ?" : "Pas encore de compte ?"}</Text>
                  <Pressable disabled={isSubmitting} onPress={() => { setMessage(""); setScreen(isRegistering ? "login" : "register"); }}>
                    <Text style={styles.link}>{isRegistering ? "Se connecter" : "Créer un compte"}</Text>
                  </Pressable>
                </View>
            </>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function AppWithErrorBoundary() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      void SplashScreen.hideAsync();
    }
  }, []);

  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

function AuthenticatedScreen(props: {
  name: string;
  user: User;
  isSubmitting: boolean;
  message: string;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AuthenticatedTab>("dashboard");
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [upcoming, setUpcoming] = useState<Contribution[]>([]);
  const [history, setHistory] = useState<Contribution[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadMessage, setLoadMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTabData() {
      setIsLoading(true);
      setLoadMessage("");

      try {
        if (activeTab === "dashboard") {
          const [nextTontines, nextUpcoming] = await Promise.all([
            tontineService.getTontines(),
            contributionService.getUpcoming(),
          ]);
          if (!cancelled) {
            setTontines(nextTontines);
            setUpcoming(nextUpcoming);
          }
        } else if (activeTab === "tontines") {
          const nextTontines = await tontineService.getTontines();
          if (!cancelled) setTontines(nextTontines);
        } else if (activeTab === "contributions") {
          const [nextUpcoming, nextHistory] = await Promise.all([
            contributionService.getUpcoming(),
            contributionService.getHistory(),
          ]);
          if (!cancelled) {
            setUpcoming(nextUpcoming);
            setHistory(nextHistory);
          }
        } else if (activeTab === "notifications") {
          const [nextNotifications, unread] = await Promise.all([
            notificationService.getNotifications(),
            notificationService.getUnreadCount(),
          ]);
          if (!cancelled) {
            setNotifications(nextNotifications);
            setUnreadCount(unread.count);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadMessage(errorMessage(error, "Impossible de charger ces données."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (activeTab !== "profile") {
      void loadTabData();
    }

    return () => {
      cancelled = true;
    };
  }, [activeTab, refreshKey]);

  async function markNotificationAsRead(notificationId: string) {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setLoadMessage(errorMessage(error, "La notification n’a pas pu être mise à jour."));
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      setLoadMessage(errorMessage(error, "Les notifications n’ont pas pu être mises à jour."));
    }
  }

  const initials = `${props.user.firstName[0] || ""}${props.user.lastName[0] || ""}`.toUpperCase() || "?";

  function renderDashboard() {
    const activeTontines = tontines.filter((tontine) => tontine.status === "active");

    return (
      <>
        <View style={styles.nativeWelcomeCard}>
          <Text style={styles.nativeEyebrow}>VOTRE ESPACE</Text>
          <Text style={styles.nativeWelcomeTitle}>Bienvenue, {props.name}</Text>
          <Text style={styles.nativeMutedText}>
            Suivez vos tontines et vos prochaines contributions.
          </Text>
        </View>

        <SectionTitle
          title="Tontines actives"
          action="Voir tout"
          onPress={() => setActiveTab("tontines")}
        />
        {activeTontines.length > 0 ? (
          activeTontines.slice(0, 3).map((tontine) => (
            <TontineCard key={tontine.id} tontine={tontine} />
          ))
        ) : (
          <EmptyNativeCard text="Aucune tontine active pour le moment." />
        )}

        <SectionTitle
          title="Prochaines contributions"
          action="Voir tout"
          onPress={() => setActiveTab("contributions")}
        />
        {upcoming.length > 0 ? (
          upcoming.slice(0, 3).map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))
        ) : (
          <EmptyNativeCard text="Aucune contribution à venir." />
        )}
      </>
    );
  }

  function renderTontines() {
    return (
      <>
        <View style={styles.nativePageHeading}>
          <View>
            <Text style={styles.nativePageTitle}>Mes tontines</Text>
            <Text style={styles.nativeMutedText}>{tontines.length} au total</Text>
          </View>
        </View>
        {tontines.length > 0 ? (
          tontines.map((tontine) => <TontineCard key={tontine.id} tontine={tontine} />)
        ) : (
          <EmptyNativeCard text="Tu ne participes encore à aucune tontine." />
        )}
      </>
    );
  }

  function renderContributions() {
    return (
      <>
        <View style={styles.nativePageHeading}>
          <Text style={styles.nativePageTitle}>Contributions</Text>
          <Text style={styles.nativeMutedText}>Gérez vos paiements</Text>
        </View>
        <Text style={styles.nativeSectionTitle}>À venir</Text>
        {upcoming.length > 0 ? (
          upcoming.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))
        ) : (
          <EmptyNativeCard text="Aucune contribution à venir." />
        )}
        <Text style={[styles.nativeSectionTitle, styles.nativeSectionSpacing]}>Historique</Text>
        {history.length > 0 ? (
          history.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))
        ) : (
          <EmptyNativeCard text="Aucun historique de paiement." />
        )}
      </>
    );
  }

  function renderNotifications() {
    return (
      <>
        <View style={styles.nativePageHeading}>
          <View>
            <Text style={styles.nativePageTitle}>Notifications</Text>
            <Text style={styles.nativeMutedText}>{unreadCount} non lue(s)</Text>
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={() => void markAllNotificationsAsRead()}>
              <Text style={styles.nativeLink}>Tout lire</Text>
            </Pressable>
          )}
        </View>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => void markNotificationAsRead(notification.id)}
              style={[styles.nativeNotificationCard, !notification.read && styles.nativeUnreadCard]}
            >
              <Text style={styles.nativeNotificationIcon}>
                {notificationEmoji(notification.type)}
              </Text>
              <View style={styles.nativeNotificationBody}>
                <Text style={styles.nativeCardTitle}>{notification.title}</Text>
                <Text style={styles.nativeMutedText}>{notification.message}</Text>
                <Text style={styles.nativeSmallText}>{formatDateLabel(notification.createdAt)}</Text>
              </View>
              {!notification.read && <View style={styles.nativeUnreadDot} />}
            </Pressable>
          ))
        ) : (
          <EmptyNativeCard text="Tu n’as aucune nouvelle notification." icon="🔔" />
        )}
      </>
    );
  }

  function renderProfile() {
    return (
      <>
        <View style={styles.nativeProfileHeader}>
          <View style={styles.nativeAvatar}>
            <Text style={styles.nativeAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.nativeProfileName}>
            {props.user.firstName} {props.user.lastName}
          </Text>
          <Text style={styles.nativeMutedText}>{props.user.phoneNumber}</Text>
          {props.user.email && <Text style={styles.nativeMutedText}>{props.user.email}</Text>}
          <Text style={styles.nativeRole}>{props.user.role}</Text>
        </View>
        <View style={styles.nativeMenu}>
          {["Modifier le profil", "Changer le mot de passe", "Préférences de notification", "Aide et support"].map(
            (label) => (
              <Pressable key={label} style={styles.nativeMenuItem}>
                <Text style={styles.nativeMenuLabel}>{label}</Text>
                <Text style={styles.nativeMenuArrow}>›</Text>
              </Pressable>
            )
          )}
        </View>
        <Pressable
          onPress={props.onLogout}
          disabled={props.isSubmitting}
          style={styles.nativeLogoutButton}
        >
          {props.isSubmitting ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={styles.nativeLogoutText}>Se déconnecter</Text>
          )}
        </Pressable>
      </>
    );
  }

  const content =
    activeTab === "dashboard"
      ? renderDashboard()
      : activeTab === "tontines"
        ? renderTontines()
        : activeTab === "contributions"
          ? renderContributions()
          : activeTab === "notifications"
            ? renderNotifications()
            : renderProfile();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.nativeApp}>
        <View style={styles.nativeHeader}>
          <View>
            <Text style={styles.nativeBrand}>Maison des Tontines</Text>
            <Text style={styles.nativeHeaderSubtitle}>
              {activeTab === "dashboard" ? "Tableau de bord" : tabLabel(activeTab)}
            </Text>
          </View>
          <Pressable onPress={() => setActiveTab("profile")} style={styles.nativeHeaderAvatar}>
            <Text style={styles.nativeHeaderAvatarText}>{initials}</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.nativeContent}
          contentContainerStyle={styles.nativeContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => setRefreshKey((key) => key + 1)}
              tintColor={colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {props.message || loadMessage ? (
            <Text style={styles.nativeError}>{props.message || loadMessage}</Text>
          ) : null}
          {isLoading && !tontines.length && !notifications.length && !upcoming.length ? (
            <View style={styles.nativeLoading}>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text style={styles.nativeMutedText}>Chargement…</Text>
            </View>
          ) : (
            content
          )}
        </ScrollView>
        <View style={styles.nativeTabBar}>
          {([
            ["dashboard", "⌂", "Accueil"],
            ["tontines", "🤝", "Tontines"],
            ["contributions", "€", "Paiements"],
            ["notifications", "🔔", "Alertes"],
            ["profile", "●", "Profil"],
          ] as const).map(([tab, icon, label]) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.nativeTab}
            >
              <Text style={[styles.nativeTabIcon, activeTab === tab && styles.nativeTabActive]}>
                {icon}
              </Text>
              <Text style={[styles.nativeTabLabel, activeTab === tab && styles.nativeTabActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function SectionTitle(props: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.nativeSectionHeader}>
      <Text style={styles.nativeSectionTitle}>{props.title}</Text>
      <Pressable onPress={props.onPress}>
        <Text style={styles.nativeLink}>{props.action}</Text>
      </Pressable>
    </View>
  );
}

function TontineCard({ tontine }: { tontine: Tontine }) {
  return (
    <View style={styles.nativeCard}>
      <View style={styles.nativeCardHeader}>
        <View style={styles.nativeCardHeading}>
          <Text style={styles.nativeCardTitle}>{tontine.name}</Text>
          <Text style={styles.nativeMutedText}>
            {tontine.type} · {tontine.frequency}
          </Text>
        </View>
        <Text style={styles.nativeStatus}>{tontine.status}</Text>
      </View>
      {!!tontine.description && (
        <Text style={styles.nativeMutedText}>{tontine.description}</Text>
      )}
      <View style={styles.nativeStats}>
        <View>
          <Text style={styles.nativeSmallText}>Montant</Text>
          <Text style={styles.nativeStatValue}>{formatMoney(tontine.amount, tontine.currency)}</Text>
        </View>
        <View>
          <Text style={styles.nativeSmallText}>Membres</Text>
          <Text style={styles.nativeStatValue}>{tontine.totalMembers}</Text>
        </View>
        <View>
          <Text style={styles.nativeSmallText}>Cycle</Text>
          <Text style={styles.nativeStatValue}>
            {tontine.currentCycle}/{tontine.totalCycles}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ContributionCard({ contribution }: { contribution: Contribution }) {
  return (
    <View style={styles.nativeCard}>
      <View style={styles.nativeCardHeader}>
        <View style={styles.nativeCardHeading}>
          <Text style={styles.nativeCardTitle}>{contribution.tontineName}</Text>
          <Text style={styles.nativeMutedText}>
            Échéance : {formatDateLabel(contribution.dueDate)}
          </Text>
        </View>
        <Text style={styles.nativeStatus}>{contribution.status}</Text>
      </View>
      <Text style={styles.nativeContributionAmount}>
        {formatMoney(contribution.amount, contribution.currency)}
      </Text>
    </View>
  );
}

function EmptyNativeCard({ text, icon = "🤝" }: { text: string; icon?: string }) {
  return (
    <View style={styles.nativeEmptyCard}>
      <Text style={styles.nativeEmptyIcon}>{icon}</Text>
      <Text style={styles.nativeMutedText}>{text}</Text>
    </View>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  }
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function notificationEmoji(type: Notification["type"]) {
  switch (type) {
    case "contribution":
      return "💰";
    case "payout":
      return "💸";
    case "dispute":
      return "⚠️";
    case "vote":
      return "🗳️";
    default:
      return "📢";
  }
}

function tabLabel(tab: AuthenticatedTab) {
  return {
    dashboard: "Tableau de bord",
    tontines: "Mes tontines",
    contributions: "Contributions",
    notifications: "Notifications",
    profile: "Profil",
  }[tab];
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean; keyboardType?: "default" | "email-address" | "phone-pad" }) {
  return (
    <>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        autoCapitalize={props.keyboardType === "email-address" ? "none" : "sentences"}
        autoComplete={props.keyboardType === "phone-pad" ? "tel" : undefined}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#8f8f9d"
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
        value={props.value}
      />
    </>
  );
}

const colors = { background: "#0a0a14", card: "#1a1a2e", input: "#30303a", accent: "#d4a574", white: "#ffffff", muted: "rgba(255,255,255,0.7)" };
const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { alignItems: "center", flexGrow: 1, justifyContent: "center", padding: 24 },
  card: { backgroundColor: colors.card, borderColor: "rgba(255,255,255,0.14)", borderRadius: 20, borderWidth: 1, maxWidth: 440, padding: 24, width: "100%" },
  logo: { fontSize: 42, marginBottom: 14, textAlign: "center" },
  title: { color: colors.white, fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 18, marginTop: 8, textAlign: "center" },
  label: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: colors.input, borderColor: "rgba(255,255,255,0.15)", borderRadius: 12, borderWidth: 1, color: colors.white, fontSize: 16, minHeight: 52, paddingHorizontal: 16 },
  message: { fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: "center" },
  info: { color: "#dfe8ff" },
  error: { color: "#ffb4ad", fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: "center" },
  button: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 12, justifyContent: "center", marginTop: 20, minHeight: 54 },
  disabled: { opacity: 0.7 },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: "700" },
  accountPrompt: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 18 },
  accountText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  nativeBackButton: { alignSelf: "flex-start", marginBottom: 8, paddingVertical: 4 },
  nativeBackButtonText: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  dashboard: { marginTop: 6 },
  welcomePanel: { backgroundColor: "rgba(212,165,116,0.12)", borderColor: "rgba(212,165,116,0.35)", borderRadius: 14, borderWidth: 1, padding: 16 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 6 },
  welcomeTitle: { color: colors.white, fontSize: 19, fontWeight: "700" },
  welcomeText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  dashboardCard: { alignItems: "center", backgroundColor: colors.input, borderColor: "rgba(255,255,255,0.12)", borderRadius: 12, borderWidth: 1, flexDirection: "row", marginTop: 12, minHeight: 66, paddingHorizontal: 14 },
  dashboardIcon: { color: colors.accent, fontSize: 12, fontWeight: "700", marginRight: 12 },
  dashboardContent: { flex: 1 },
  dashboardTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  dashboardText: { color: colors.muted, fontSize: 12, marginTop: 3 },
  chevron: { color: colors.accent, fontSize: 28 },
  logoutButton: { alignItems: "center", borderColor: "rgba(212,165,116,0.7)", borderRadius: 12, borderWidth: 1, justifyContent: "center", marginTop: 8, minHeight: 48 },
  logoutText: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  errorScreen: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  errorTitle: { color: colors.white, fontSize: 20, fontWeight: "700", textAlign: "center" },
  errorText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: "center" },
  errorDetails: { color: "#ffb4ad", fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: "center" },
  authenticatedScreen: { backgroundColor: colors.background, flex: 1, padding: 24 },
  authenticatedTitle: { color: colors.accent, fontSize: 24, fontWeight: "700", marginTop: 24, textAlign: "center" },
  authenticatedWelcome: { color: colors.white, fontSize: 22, fontWeight: "700", marginTop: 32, textAlign: "center" },
  authenticatedText: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 12, textAlign: "center" },
  authenticatedPanel: { backgroundColor: colors.card, borderColor: "rgba(255,255,255,0.14)", borderRadius: 16, borderWidth: 1, marginTop: 32, padding: 20 },
  authenticatedPanelTitle: { color: colors.white, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  authenticatedPanelText: { borderTopColor: "rgba(255,255,255,0.12)", borderTopWidth: 1, color: colors.muted, fontSize: 16, paddingVertical: 14 },
  nativeApp: { backgroundColor: colors.background, flex: 1 },
  nativeHeader: { alignItems: "center", borderBottomColor: "rgba(255,255,255,0.08)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  nativeBrand: { color: colors.accent, fontSize: 18, fontWeight: "700" },
  nativeHeaderSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  nativeHeaderAvatar: { alignItems: "center", backgroundColor: colors.card, borderColor: colors.accent, borderRadius: 20, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  nativeHeaderAvatarText: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  nativeContent: { flex: 1 },
  nativeContentContainer: { padding: 20, paddingBottom: 28 },
  nativeWelcomeCard: { backgroundColor: "rgba(212,165,116,0.12)", borderColor: "rgba(212,165,116,0.35)", borderRadius: 16, borderWidth: 1, marginBottom: 24, padding: 18 },
  nativeEyebrow: { color: colors.accent, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 7 },
  nativeWelcomeTitle: { color: colors.white, fontSize: 22, fontWeight: "700" },
  nativePageHeading: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  nativePageTitle: { color: colors.white, fontSize: 24, fontWeight: "700" },
  nativeSectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 4 },
  nativeSectionTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  nativeSectionSpacing: { marginTop: 16 },
  nativeLink: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  nativeMutedText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  nativeSmallText: { color: "rgba(255,255,255,0.48)", fontSize: 11, lineHeight: 16 },
  nativeCard: { backgroundColor: colors.card, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 16 },
  nativeCardHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  nativeCardHeading: { flex: 1, paddingRight: 10 },
  nativeCardTitle: { color: colors.white, fontSize: 15, fontWeight: "700" },
  nativeStatus: { color: colors.accent, fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  nativeStats: { borderTopColor: "rgba(255,255,255,0.1)", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 13, paddingTop: 12 },
  nativeStatValue: { color: colors.white, fontSize: 13, fontWeight: "700", marginTop: 3 },
  nativeContributionAmount: { color: colors.accent, fontSize: 17, fontWeight: "700", marginTop: 4 },
  nativeEmptyCard: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, borderWidth: 1, marginBottom: 20, padding: 20 },
  nativeEmptyIcon: { fontSize: 28, marginBottom: 6 },
  nativeLoading: { alignItems: "center", paddingVertical: 70 },
  nativeError: { backgroundColor: "rgba(255,120,110,0.12)", borderColor: "rgba(255,180,173,0.35)", borderRadius: 10, borderWidth: 1, color: "#ffb4ad", fontSize: 13, lineHeight: 19, marginBottom: 16, padding: 12 },
  nativeNotificationCard: { alignItems: "flex-start", backgroundColor: colors.card, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, borderWidth: 1, flexDirection: "row", marginBottom: 10, padding: 14 },
  nativeUnreadCard: { backgroundColor: "rgba(212,165,116,0.14)", borderColor: "rgba(212,165,116,0.35)" },
  nativeNotificationIcon: { fontSize: 22, marginRight: 12 },
  nativeNotificationBody: { flex: 1 },
  nativeUnreadDot: { backgroundColor: colors.accent, borderRadius: 4, height: 8, marginLeft: 8, marginTop: 4, width: 8 },
  nativeProfileHeader: { alignItems: "center", paddingVertical: 16 },
  nativeAvatar: { alignItems: "center", backgroundColor: colors.card, borderColor: colors.accent, borderRadius: 44, borderWidth: 2, height: 88, justifyContent: "center", marginBottom: 14, width: 88 },
  nativeAvatarText: { color: colors.accent, fontSize: 28, fontWeight: "700" },
  nativeProfileName: { color: colors.white, fontSize: 22, fontWeight: "700" },
  nativeRole: { color: colors.accent, fontSize: 12, fontWeight: "700", marginTop: 8, textTransform: "capitalize" },
  nativeMenu: { backgroundColor: colors.card, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, borderWidth: 1, marginVertical: 20, overflow: "hidden" },
  nativeMenuItem: { alignItems: "center", borderBottomColor: "rgba(255,255,255,0.1)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  nativeMenuLabel: { color: colors.white, fontSize: 14 },
  nativeMenuArrow: { color: colors.muted, fontSize: 25, fontWeight: "300" },
  nativeLogoutButton: { alignItems: "center", borderColor: "rgba(212,165,116,0.7)", borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 50 },
  nativeLogoutText: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  nativeTabBar: { backgroundColor: colors.card, borderTopColor: "rgba(255,255,255,0.12)", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-around", paddingBottom: 8, paddingTop: 10 },
  nativeTab: { alignItems: "center", flex: 1, minHeight: 44 },
  nativeTabIcon: { color: colors.muted, fontSize: 18, height: 22, textAlign: "center" },
  nativeTabLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  nativeTabActive: { color: colors.accent, fontWeight: "700" },
});