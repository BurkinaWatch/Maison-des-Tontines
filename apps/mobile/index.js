import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { Platform } from "react-native";
import NativeApp from "./App";

const context = require.context("./app");

function App() {
  return Platform.OS === "web" ? <ExpoRoot context={context} /> : <NativeApp />;
}

registerRootComponent(App);