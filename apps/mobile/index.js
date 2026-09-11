import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import NativeApp from "./App";

function App() {
  if (Platform.OS !== "web") {
    return <NativeApp />;
  }

  // Keep Expo Router out of the native startup path. A route module failure
  // must not prevent the direct Android/iOS entry screen from mounting.
  const { ExpoRoot } = require("expo-router");
  const context = require.context("./app");
  return <ExpoRoot context={context} />;
}

registerRootComponent(App);