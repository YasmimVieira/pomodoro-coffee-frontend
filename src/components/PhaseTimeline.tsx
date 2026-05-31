import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PHASES, PHASE_STARTS } from '../constants/phases';
import { theme } from '../constants/theme';

export function PhaseTimeline({ elapsed }: { elapsed: number }) {
  return (
    <View style={styles.row}>
      {PHASES.map((phase, i) => {
        // Quanto desta fase já passou (0 a 1)
        const progress = Math.min(
          1,
          Math.max(0, (elapsed - PHASE_STARTS[i]) / phase.duration)
        );

        return (
          <View
            key={phase.key}
            style={[
              styles.track,
              { flex: phase.duration }, // proporcional à duração
            ]}
          >
            <View
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                borderRadius: 4,
                backgroundColor:
                  phase.type === 'focus'
                    ? theme.colors.amber              // âmbar para foco
                    : 'rgba(244,236,225,0.5)',         // branco suave para pausa
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
    height: 4,
    borderRadius: 4,
    backgroundColor: theme.colors.line,
    overflow: 'hidden',
  },
});