import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/store/authStore";
import { I18nProvider } from "../src/i18n";
import { notificationService } from "../src/services/notification.service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthBootstrap() {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) void notificationService.registerDeviceToken().catch(() => undefined);
  }, [isAuthenticated]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <I18nProvider>
          <AuthBootstrap />
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
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/password" options={{ headerShown: false }} />
          <Stack.Screen name="profile/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="profile/payment-methods" options={{ headerShown: false }} />
          <Stack.Screen name="profile/preferences" options={{ headerShown: false }} />
          <Stack.Screen name="profile/help" options={{ headerShown: false }} />
          <Stack.Screen name="profile/legal" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
          </Stack>
        </I18nProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
