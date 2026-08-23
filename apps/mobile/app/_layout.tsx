import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
