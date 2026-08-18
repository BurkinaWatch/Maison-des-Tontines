import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaWrapper } from "../../src/components/layout";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { CreateTontineForm } from "../../src/components/forms/CreateTontineForm";
import { colors, spacing } from "../../src/theme";

export default function CreateTontineScreen() {
  const handleSubmit = async (data: any) => {
    console.log("Creating tontine:", data);
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
