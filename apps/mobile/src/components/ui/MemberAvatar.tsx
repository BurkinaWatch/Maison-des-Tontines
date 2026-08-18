import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType } from "react-native";
import { colors, spacing, borderRadius } from "../../theme";

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "small" | "medium" | "large";
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  name,
  avatarUrl,
  size = "medium",
  showStatus = false,
  status,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    small: { container: 32, text: 12, status: 8 },
    medium: { container: 48, text: 16, status: 12 },
    large: { container: 64, text: 20, status: 14 },
  };

  const statusColors = {
    online: colors.success,
    offline: colors.textTertiary,
    away: colors.warning,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: sizeStyles[size].container,
            height: sizeStyles[size].container,
            borderRadius: sizeStyles[size].container / 2,
          },
        ]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[
              styles.image,
              {
                width: sizeStyles[size].container,
                height: sizeStyles[size].container,
                borderRadius: sizeStyles[size].container / 2,
              },
            ]}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                fontSize: sizeStyles[size].text,
              },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>
      {showStatus && status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: sizeStyles[size].status,
              height: sizeStyles[size].status,
              borderRadius: sizeStyles[size].status / 2,
              backgroundColor: statusColors[status],
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  avatar: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    color: colors.accent,
    fontWeight: "700" as const,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
