import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { formatMMSS } from '../constants/phases';

interface Props {
  title: string;    // "Foco", "Pausa", "Café pronto!"
  subtitle: string; // subtítulo abaixo do título
  remaining: number;
  idle: boolean;
}

export function TimerDisplay({ title, subtitle, remaining, idle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>

      {/* allowFontScaling=false impede o usuário de mudar o tamanho */}
      <Text style={styles.clock} allowFontScaling={false}>
        {idle ? '25:00' : formatMMSS(remaining)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: theme.colors.cream,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 4,
    marginBottom: 14,
  },
  clock: {
    fontFamily: theme.fonts.mono, // GeistMono — carregado no App.tsx
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -1,
    color: theme.colors.cream,
  },
});