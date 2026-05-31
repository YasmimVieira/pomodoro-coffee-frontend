import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePomodoro } from '../state/usePomodoro';
import { useHistory } from '../state/HistoryContext';
import { useAuth } from '../state/AuthContext';
import { CoffeeCup } from '../components/CoffeeCup';
import { TimerDisplay } from '../components/TimerDisplay';
import { PhaseTimeline } from '../components/PhaseTimeline';
import { Controls } from '../components/Controls';
import { schedulePhaseNotification, cancelAllNotifications } from '../utils/notifications';
import { interstitial } from '../utils/interstitialAd';
import { PHASES } from '../constants/phases';
import { theme } from '../constants/theme';

const { colors } = theme;

export function TimerScreen({ onOpenProfile }: { onOpenProfile: () => void }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addCycle } = useHistory();
  const pomodoro = usePomodoro();
  const completedRef = useRef(false); // evita registrar duas vezes

  const { status, phase, elapsed, remaining, fill, running, started } = pomodoro;
  const completed = status === 'COMPLETED';
  const idle      = status === 'IDLE';

  // Registra ciclo e exibe anúncio UMA VEZ ao completar
  useEffect(() => {
    if (completed && !completedRef.current) {
      completedRef.current = true;
      addCycle(50); // 50 minutos de foco por ciclo
      cancelAllNotifications();
      setTimeout(() => interstitial.show(), 800);
    }
    if (!completed) completedRef.current = false;
  }, [completed, addCycle]);

  // Re-agenda notificação quando o timer inicia/retoma
  useEffect(() => {
    if (!running) {
      cancelAllNotifications();
      return;
    }
    schedulePhaseNotification(remaining, PHASES[pomodoro.phaseIndex].notificationMsg);
  }, [running, pomodoro.phaseIndex, remaining]);

  const handleReset = useCallback(() => {
    cancelAllNotifications();
    pomodoro.reset();
  }, [pomodoro]);

  const title    = idle ? 'Pronto?' : completed ? 'Café pronto!' : phase.label;
  const subtitle = idle
    ? 'Toque para iniciar o ciclo de 60 min'
    : completed ? 'Bom trabalho — aproveite'
    : phase.sub;

  const stateColor =
    phase.type === 'focus' && !idle && !completed
      ? colors.amber
      : colors.muted;

  // Iniciais do nome do usuário para o avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
      locations={[0, 0.52, 1]}
      style={[styles.fill, { paddingTop: insets.top + 8 }]}
    >
      {/* Header: chip de estado + avatar */}
      <View style={styles.header}>
        <View style={[styles.chip, { borderColor: colors.line }]}>
          <Text style={[styles.chipText, { color: stateColor }]}>{status}</Text>
        </View>
        <Pressable onPress={onOpenProfile} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
      </View>

      {/* Xícara (ocupa o espaço disponível) */}
      <View style={styles.cup}>
        <CoffeeCup
          fill={fill}
          showSteam={phase.type === 'break' && !idle}
          completed={completed}
          idle={idle}
        />
      </View>

      {/* Timer */}
      <TimerDisplay
        title={title}
        subtitle={subtitle}
        remaining={remaining}
        idle={idle}
      />

      {/* Barra das 4 fases */}
      <View style={{ marginTop: 20 }}>
        <PhaseTimeline elapsed={elapsed} />
      </View>

      {/* Controles */}
      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Controls
          started={started}
          running={running}
          completed={completed}
          onStart={pomodoro.start}
          onPause={pomodoro.pause}
          onReset={handleReset}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center' },
  header: {
    width: '100%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 22, marginBottom: 4,
  },
  chip: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: 'rgba(244,236,225,0.03)',
  },
  chipText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11, letterSpacing: 2.5,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a120b',
  },
  avatarText: { color: colors.amber, fontSize: 15, fontWeight: '600' },
  cup: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});