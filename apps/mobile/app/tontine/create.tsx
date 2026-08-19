import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { CreateTontineForm } from "../../src/components/forms/CreateTontineForm";
import { colors, spacing } from "../../src/theme";
import { useTontines } from "../../src/hooks/useTontines";
import { useRouter } from "expo-router";

export default function CreateTontineScreen() {
  const router = useRouter();
  const { createTontine } = useTontines();

  const handleSubmit = async (data: any) => {
    try {
      await createTontine(data);
      router.replace("/(tabs)/tontines");
    } catch (error) {
      console.error("Failed to create tontine:", error);
    }
  };

  return (
    <SafeAreaWrapper>
      <AppHeader title="Create Tontine" showBack showProfile />
      <View style={styles.container}>
        <CreateTontineForm onSubmit={handleSubmit} />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
