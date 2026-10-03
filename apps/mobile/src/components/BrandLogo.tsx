import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";

export type BrandLogoVariant = "mark" | "wordmark" | "tagline";

type BrandLogoProps = {
  variant: BrandLogoVariant;
  width: number;
  height: number;
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
};

const sources = {
  mark: require("../../assets/brand-mark.png"),
  wordmark: require("../../assets/brand-wordmark.png"),
  tagline: require("../../assets/brand-tagline.png"),
};

const defaultLabels: Record<BrandLogoVariant, string> = {
  mark: "Emblème de la Maison des Tontines",
  wordmark: "La Maison des Tontines",
  tagline: "La Maison des Tontines — épargner ensemble, s’entraider, grandir ensemble",
};

export function BrandLogo({
  variant,
  width,
  height,
  accessibilityLabel,
  style,
}: BrandLogoProps) {
  return (
    <Image
      accessible
      accessibilityLabel={accessibilityLabel ?? defaultLabels[variant]}
      accessibilityRole="image"
      resizeMode="contain"
      source={sources[variant]}
      style={[{ width, height }, style]}
    />
  );
}