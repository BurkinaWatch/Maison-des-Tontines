import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Component, ErrorInfo, ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
