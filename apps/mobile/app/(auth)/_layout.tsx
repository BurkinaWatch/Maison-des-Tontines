import { Stack } from "expo-router";
import { SafeAreaView, View, Text, StyleSheet, Platform } from "react-native";
import { colors } from "../../src/theme";

export default function AuthLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
});
