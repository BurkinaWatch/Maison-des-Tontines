import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Screen = "login" | "register";

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
      const { authService } = await import("./src/services/auth.service");
      const { user } = await authService.login({ email: email.trim(), password });
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
      const { authService } = await import("./src/services/auth.service");
      const { user } = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
      });
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
      const { authService } = await import("./src/services/auth.service");
      await authService.logout();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
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

            {connectedName ? (
              <View style={styles.dashboard}>
                <View style={styles.welcomePanel}>
                  <Text style={styles.eyebrow}>TABLEAU DE BORD</Text>
                  <Text style={styles.welcomeTitle}>Ton espace Maison des Tontines</Text>
                  <Text style={styles.welcomeText}>
                    Retrouve tes tontines, tes contributions et tes notifications.
                  </Text>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardIcon}>Groupes</Text>
                  <View style={styles.dashboardContent}>
                    <Text style={styles.dashboardTitle}>Mes tontines</Text>
                    <Text style={styles.dashboardText}>Consulte tes groupes et leur activité</Text>
                  </View>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardIcon}>Paiements</Text>
                  <View style={styles.dashboardContent}>
                    <Text style={styles.dashboardTitle}>Contributions</Text>
                    <Text style={styles.dashboardText}>Suis tes paiements et échéances</Text>
                  </View>
                </View>
                <View style={styles.dashboardCard}>
                  <Text style={styles.dashboardIcon}>Infos</Text>
                  <View style={styles.dashboardContent}>
                    <Text style={styles.dashboardTitle}>Notifications</Text>
                    <Text style={styles.dashboardText}>Reste informé de la vie de tes tontines</Text>
                  </View>
                </View>
                {message ? <Text style={styles.error}>{message}</Text> : null}
                <Pressable onPress={handleLogout} disabled={isSubmitting} style={styles.logoutButton}>
                  {isSubmitting ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.logoutText}>Se déconnecter</Text>}
                </Pressable>
              </View>
            ) : (
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
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
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
});