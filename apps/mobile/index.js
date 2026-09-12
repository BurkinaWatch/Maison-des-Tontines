import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, Text, View } from "react-native";

function NativeBootstrap() {
  const [NativeApp, setNativeApp] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;

    import("./App")
      .then(({ default: AppModule }) => {
        if (mounted) setNativeApp(() => AppModule);
      })
      .catch((error) => {
        console.error("Unable to load the native application", error);
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (NativeApp) {
    return <NativeApp />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#0a0a14", flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        {loadError ? (
          <>
            <Text style={{ color: "#d4a574", fontSize: 36, marginBottom: 16 }}>⚠️</Text>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              L’application n’a pas pu démarrer
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                lineHeight: 21,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {loadError}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator color="#d4a574" size="large" />
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                marginTop: 16,
              }}
            >
              Chargement de Maison des Tontines…
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function App() {
  if (Platform.OS !== "web") {
    return <NativeBootstrap />;
  }

  // Keep Expo Router out of the native startup path. A route module failure
  // must not prevent the direct Android/iOS entry screen from mounting.
  const { ExpoRoot } = require("expo-router");
  const context = require.context("./app");
  return <ExpoRoot context={context} />;
}

registerRootComponent(App);