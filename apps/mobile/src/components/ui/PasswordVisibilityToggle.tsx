import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function PasswordVisibilityToggle({
  visible,
  onPress,
  style,
}: PasswordVisibilityToggleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      accessibilityState={{ checked: visible }}
      hitSlop={10}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
          stroke="#A9A9B3"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={12} cy={12} r={3} stroke="#A9A9B3" strokeWidth={1.8} />
        {!visible && (
          <Path
            d="m4 4 16 16"
            stroke="#A9A9B3"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    minHeight: 40,
  },
});
