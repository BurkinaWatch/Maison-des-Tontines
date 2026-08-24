import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

const context = require.context("./app");

function App() {
  return <ExpoRoot context={context} />;
}

registerRootComponent(App);