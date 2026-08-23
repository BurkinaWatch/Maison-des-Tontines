import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Component, ErrorInfo, ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authService } from "../src/services/auth.service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  if (Platform.OS === "android") {
    return (
      <SafeAreaProvider>
        <AndroidLoginScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StartupErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0a0a14" },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="tontine/create" options={{ headerShown: false }} />
            <Stack.Screen name="tontine/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="tontine/[id]/cycles"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tontine/[id]/members"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tontine/[id]/settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="contribution/pay"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="contribution/history"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="vote/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="dispute/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="payout/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
          </Stack>
        </StartupErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function AndroidLoginScreen() {
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

  if (connectedName) {
    return (
      <View style={styles.androidContainer}>
        <View style={styles.androidCard}>
          <Text style={styles.androidLogo}>🏠</Text>
          <Text style={styles.androidTitle}>Bienvenue, {connectedName}</Text>
          <Text style={styles.androidSubtitle}>
            Ta session est enregistrée. L’application est prête.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.androidContainer}>
      <View style={styles.androidCard}>
        <Text style={styles.androidLogo}>🏠</Text>
        <Text style={styles.androidTitle}>Maison des Tontines</Text>
        <Text style={styles.androidSubtitle}>Connecte-toi à ton compte</Text>

        <Text style={styles.androidLabel}>Adresse e-mail</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          placeholderTextColor="#8f8f9d"
          style={styles.androidInput}
          value={email}
        />

        <Text style={styles.androidLabel}>Mot de passe</Text>
        <TextInput
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Votre mot de passe"
          placeholderTextColor="#8f8f9d"
          secureTextEntry
          style={styles.androidInput}
          value={password}
        />

        <Pressable
          disabled={isSubmitting}
          onPress={handleLogin}
          style={[
            styles.androidButton,
            isSubmitting && styles.androidButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.androidButtonText}>Se connecter</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

type StartupErrorBoundaryProps = {
  children: ReactNode;
};

type StartupErrorBoundaryState = {
  error: Error | null;
};

class StartupErrorBoundary extends Component<
  StartupErrorBoundaryProps,
  StartupErrorBoundaryState
> {
  state: StartupErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): StartupErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Startup render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          L’application a rencontré un problème
        </Text>
        <Text style={styles.errorMessage}>{this.state.error.message}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => this.setState({ error: null })}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  androidContainer: {
    alignItems: "center",
    backgroundColor: "#0a0a14",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  androidCard: {
    backgroundColor: "#1a1a2e",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 440,
    padding: 24,
    width: "100%",
  },
  androidLogo: {
    fontSize: 42,
    marginBottom: 14,
    textAlign: "center",
  },
  androidTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  androidSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    marginTop: 8,
    textAlign: "center",
  },
  androidLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  androidInput: {
    backgroundColor: "#30303a",
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    borderWidth: 1,
    color: "#ffffff",
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  androidButton: {
    alignItems: "center",
    backgroundColor: "#d4a574",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 54,
  },
  androidButtonDisabled: {
    opacity: 0.7,
  },
  androidButtonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0a0a14",
  },
  errorTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  errorMessage: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#d4a574",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  retryText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "600",
  },
});
