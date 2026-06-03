import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { theme } from '../constants/theme';

const { colors } = theme;

// Botão circular reutilizável
function RoundButton({
  onPress, primary, size = 60, children,
}: {
  onPress: () => void;
  primary?: boolean;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: pressed ? 0.9 : 1 }],
        },
        primary ? styles.primary : styles.secondary,
      ]}
    >
      {children}
    </Pressable>
  );
}

// Ícones SVG inline
const PlayIcon  = (c: string) => (
  <Svg width={22} height={22} viewBox="0 0 22 22">
    <Path d="M6 3.5l13 7.5-13 7.5z" fill={c} />
  </Svg>
);
const PauseIcon = (c: string) => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Rect x={3}  y={2} width={5} height={16} rx={1.6} fill={c} />
    <Rect x={12} y={2} width={5} height={16} rx={1.6} fill={c} />
  </Svg>
);
const ResetIcon = (c: string) => (
  <Svg width={20} height={20} viewBox="0 0 22 22">
    <Path
      d="M4 11a7 7 0 1 0 2-4.9M5 2v5h5"
      fill="none" stroke={c} strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

interface Props {
  started: boolean;
  running: boolean;
  completed: boolean;
  waitingForNext: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function Controls({
  started, running, completed, waitingForNext, onStart, onPause, onReset
}: Props) {

  // Ciclo completo → só botão de recomeçar
  if (completed) return (
    <View style={styles.row}>
      <RoundButton primary size={72} onPress={onReset}>
        {ResetIcon(colors.onAmber)}
      </RoundButton>
    </View>
  );

  // Ainda não iniciou OU aguardando início da próxima fase → botão grande de play
  if (!started || waitingForNext) return (
    <View style={styles.row}>
      <RoundButton primary size={84} onPress={onStart}>
        {PlayIcon(colors.onAmber)}
      </RoundButton>
    </View>
  );

  // Em andamento → reset (esq) + play/pause (centro)
  return (
    <View style={styles.row}>
      <RoundButton onPress={onReset}>
        {ResetIcon(colors.muted)}
      </RoundButton>
      <RoundButton primary size={72} onPress={running ? onPause : onStart}>
        {running ? PauseIcon(colors.onAmber) : PlayIcon(colors.onAmber)}
      </RoundButton>
      <View style={{ width: 60 }} />{/* espaço para centralizar o botão do meio */}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    height: 84,
  },
  btn: { alignItems: 'center', justifyContent: 'center' },
  primary: {
    backgroundColor: colors.amberLight,
  },
  secondary: {
    backgroundColor: 'rgba(244,236,225,0.04)',
    borderWidth: 1.4,
    borderColor: colors.line,
  },
});