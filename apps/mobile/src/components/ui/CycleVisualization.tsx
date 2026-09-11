import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors, spacing, typography } from "../../theme";
import { useI18n } from "../../i18n";

interface CycleVisualizationProps {
  totalCycles: number;
  currentCycle: number;
  completedCycles: number;
  size?: number;
  strokeWidth?: number;
}

export const CycleVisualization: React.FC<CycleVisualizationProps> = ({
  totalCycles,
  currentCycle,
  completedCycles,
  size = 200,
  strokeWidth = 12,
}) => {
  const { t } = useI18n();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalCycles > 0 ? (completedCycles / totalCycles) * circumference : 0;
  const center = size / 2;

  const segments = [];
  const anglePerSegment = 360 / totalCycles;

  for (let i = 0; i < totalCycles; i++) {
    const startAngle = i * anglePerSegment - 90;
    const endAngle = (i + 1) * anglePerSegment - 90;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = anglePerSegment > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
    ].join(" ");

    const isCompleted = i < completedCycles;
    const isCurrent = i === currentCycle - 1;

    segments.push(
      <Path
        key={i}
        d={pathData}
        stroke={isCompleted ? colors.success : isCurrent ? colors.accent : colors.borderLight}
        strokeWidth={isCurrent ? strokeWidth + 4 : strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={isCompleted || isCurrent ? 1 : 0.4}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accent} />
            <Stop offset="100%" stopColor={colors.accentDark} />
          </LinearGradient>
        </Defs>
        {segments}
      </Svg>
      <View style={styles.centerContent}>
        <Text style={styles.cycleText}>
          {completedCycles}/{totalCycles}
        </Text>
        <Text style={styles.labelText}>{t("Cycles")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cycleText: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  labelText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
