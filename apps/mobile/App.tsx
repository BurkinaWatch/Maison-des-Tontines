import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authService } from "./src/services/auth.service";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedName, setConnectedName] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Informations manquantes", "Saisis ton e-mail et ton mot de passe.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await authService.login({
        email: email.trim(),
        password,
      });
      setConnectedName(user.firstName || user.email || "Membre");
    } catch (error) {
      Alert.alert(
        "Connexion impossible",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Réessaie dans un instant."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>
            {connectedName ? `Bienvenue, ${connectedName}` : "Maison des Tontines"}
          </Text>
          <Text style={styles.subtitle}>
            {connectedName
              ? "Ta session est enregistrée. L’application est prête."
              : "Connecte-toi à ton compte"}
          </Text>

          {!connectedName && (
            <>
              <Text style={styles.label}>Adresse e-mail</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                placeholderTextColor="#8f8f9d"
                style={styles.input}
                value={email}
              />
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor="#8f8f9d"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <Pressable
                disabled={isSubmitting}
                onPress={handleLogin}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const colors = {
  background: "#0a0a14",
  card: "#1a1a2e",
  input: "#30303a",
  accent: "#d4a574",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.7)",
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 440,
    padding: 24,
    width: "100%",
  },
  logo: {
    fontSize: 42,
    marginBottom: 14,
    textAlign: "center",
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    marginTop: 8,
    textAlign: "center",
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.input,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    borderWidth: 1,
    color: colors.white,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 54,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});