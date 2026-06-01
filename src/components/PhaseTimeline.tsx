import React from 'react';
import { View, StyleSheet } from 'react-native';
import { type Phase } from '../constants/phases';
import { theme } from '../constants/theme';

interface Props {
  elapsed: number;   // totalElapsed em segundos
  phases:  Phase[];  // fases dinâmicas vindas do usePomodoro
}

export function PhaseTimeline({ elapsed, phases }: Props) {
  // Computa os offsets dinamicamente a partir das fases recebidas
  const phaseStarts = phases.reduce<number[]>((arr, _, i) =>
    [...arr, i === 0 ? 0 : arr[i - 1] + phases[i - 1].duration], []);

  return (
    <View style={styles.row}>
      {phases.map((phase, i) => {
        const progress = Math.min(
          1,
          Math.max(0, (elapsed - phaseStarts[i]) / phase.duration)
        );
        return (
          <View
            key={phase.key}
            style={[styles.track, { flex: phase.duration }]}
          >
            <View
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                borderRadius: 4,
                backgroundColor: phase.type === 'focus'
                  ? theme.colors.amber
                  : 'rgba(244,236,225,0.5)',
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, width: 232 },
  track: {
    height: 4, borderRadius: 4,
    backgroundColor: theme.colors.line,
    overflow: 'hidden',
  },
});
