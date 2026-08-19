import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "../src/theme";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.description}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Pressable
        onPress={() => router.replace("/(tabs)/")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  code: {
    fontSize: 72,
    fontWeight: "700",
    color: colors.accent,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  buttonText: {
    ...typography.button,
    color: colors.primary,
  },
});
