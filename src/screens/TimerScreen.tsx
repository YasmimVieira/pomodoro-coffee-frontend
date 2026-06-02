import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePomodoro } from '../state/usePomodoro';
import { useHistory } from '../state/HistoryContext';
import { useAuth } from '../state/AuthContext';
import { useSettings } from '../state/SettingsContext';
import { CoffeeCup } from '../components/CoffeeCup';
import { TimerDisplay } from '../components/TimerDisplay';
import { PhaseTimeline } from '../components/PhaseTimeline';
import { Controls } from '../components/Controls';
import { CoffeeConfetti } from '../components/CoffeeConfetti';
import { SettingsModal } from './SettingsModal';
import { schedulePhaseNotification, cancelAllNotifications } from '../utils/notifications';
import { interstitial } from '../utils/interstitialAd';
import { sendTimerStateToWatch, onWatchAction } from '../utils/watchBridge';
import { haptics } from '../utils/haptics';
import { theme } from '../constants/theme';

const { colors } = theme;

const GearIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      fill="none" stroke={colors.muted} strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

export function TimerScreen({ onOpenProfile }: { onOpenProfile: () => void }) {
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const { addCycle, newUnlock, clearUnlock } = useHistory();
  const { focusMin, breakMin } = useSettings();

  // ← speed=300 para testar conquistas rapidamente; trocar por 1 em produção
  const pomodoro = usePomodoro(300, focusMin * 60, breakMin * 60);
  const completedRef   = useRef(false);
  const prevWaitingRef = useRef(false);

  const [showConfetti,    setShowConfetti]    = useState(false);
  const [toastAchievement, setToastAchievement] = useState<{ name: string; description: string } | null>(null);

  const {
    status, phase, phaseIndex,
    remaining, fill, running, started,
    waitingForNext, phases, totalElapsed,
  } = pomodoro;

  const completed = status === 'COMPLETED';
  const idle      = status === 'IDLE';

  const [focusTask,    setFocusTask]    = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const nextPhase = waitingForNext && phaseIndex + 1 < phases.length
    ? phases[phaseIndex + 1]
    : null;

  // Confetti + toast + notificação ao desbloquear conquista
  useEffect(() => {
    if (!newUnlock) return;

    setShowConfetti(true);
    haptics.success();

    // Toast in-app (sempre visível, independe de permissão do sistema)
    setToastAchievement({ name: newUnlock.name, description: newUnlock.description });
    const hideToast = setTimeout(() => setToastAchievement(null), 4000);

    // Notificação do sistema (funciona no background / device real)
    Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Conquista desbloqueada!',
        body:  `${newUnlock.name} — ${newUnlock.description}`,
        sound: true,
      },
      trigger: { seconds: 2, channelId: 'pomodoro' } as any,
    }).catch(() => {});

    clearUnlock();
    return () => clearTimeout(hideToast);
  }, [newUnlock, clearUnlock]);

  // Haptics nas transições de fase
  useEffect(() => {
    if (waitingForNext && !prevWaitingRef.current) {
      haptics.heavy(); // fase terminou
    } else if (!waitingForNext && prevWaitingRef.current && running) {
      haptics.light(); // nova fase iniciou
    }
    prevWaitingRef.current = waitingForNext;
  }, [waitingForNext, running]);

  useEffect(() => {
    if (completed) haptics.success();
  }, [completed]);

  // Registra ciclo ao completar
  useEffect(() => {
    if (completed && !completedRef.current) {
      completedRef.current = true;
      addCycle(focusMin * 2);
      cancelAllNotifications();
      setTimeout(() => interstitial.show(), 800);
    }
    if (!completed) completedRef.current = false;
  }, [completed, addCycle, focusMin]);

  // Notificações
  useEffect(() => {
    if (running) {
      schedulePhaseNotification(remaining, phase.notificationMsg);
      return;
    }
    if (!waitingForNext) cancelAllNotifications();
  }, [running, waitingForNext, phaseIndex, remaining]);

  // Sincroniza com Apple Watch
  useEffect(() => {
    sendTimerStateToWatch(pomodoro);
  }, [pomodoro.running, pomodoro.phaseIndex, pomodoro.remaining, pomodoro.waitingForNext]);

  useEffect(() => {
    return onWatchAction(action => {
      if (action === 'start') pomodoro.start();
      else if (action === 'pause') pomodoro.pause();
    });
  }, [pomodoro.start, pomodoro.pause]);

  const handleReset = useCallback(() => {
    cancelAllNotifications();
    pomodoro.reset();
  }, [pomodoro]);

  // Textos
  const title = idle
    ? 'Pronto?'
    : completed
    ? 'Café pronto!'
    : waitingForNext
    ? nextPhase?.type === 'break' ? 'Hora da pausa! ☁️' : 'Hora de focar! 🔥'
    : phase.label;

  const subtitle = idle
    ? focusTask ? `"${focusTask}"` : 'Toque play para iniciar'
    : completed
    ? 'Bom trabalho — aproveite'
    : waitingForNext
    ? 'Toque play para começar'
    : focusTask
    ? `"${focusTask}" · ${phase.sub}`
    : phase.sub;

  const displayRemaining = waitingForNext && nextPhase
    ? nextPhase.duration
    : remaining;

  const stateColor = phase.type === 'focus' && !idle && !completed
    ? colors.amber : colors.muted;

  const statusLabel: Record<string, string> = {
    IDLE:      'AGUARDANDO',
    FOCUS_1:   'FOCO · 1/2',
    BREAK_1:   'PAUSA · 1/2',
    FOCUS_2:   'FOCO · 2/2',
    BREAK_2:   'PAUSA · 2/2',
    COMPLETED: 'COMPLETO',
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
      locations={[0, 0.52, 1]}
      style={[styles.fill, { paddingTop: insets.top + 8 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.chip, { borderColor: colors.line }]}>
          <Text style={[styles.chipText, { color: stateColor }]}>{statusLabel[status] ?? status}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Engrenagem de configurações — só quando idle */}
          {idle && (
            <Pressable
              onPress={() => setShowSettings(true)}
              style={[styles.iconBtn, { marginRight: 8 }]}
            >
              <GearIcon />
            </Pressable>
          )}
          <Pressable onPress={onOpenProfile} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      {/* Xícara */}
      <View style={styles.cup}>
        <CoffeeCup
          fill={fill}
          showSteam={phase.type === 'break' && !idle}
          completed={completed}
          idle={idle}
        />
      </View>

      {/* Input de tarefa — só quando idle */}
      {idle && (
        <TextInput
          value={focusTask}
          onChangeText={setFocusTask}
          placeholder="Em que você vai focar?"
          placeholderTextColor={colors.faint ?? colors.muted}
          style={styles.taskInput}
          maxLength={60}
          returnKeyType="done"
        />
      )}

      {/* Timer */}
      <TimerDisplay
        title={title}
        subtitle={subtitle}
        remaining={displayRemaining}
      />

      {/* Barra das fases */}
      <View style={{ marginTop: 20 }}>
        <PhaseTimeline elapsed={totalElapsed} phases={phases} />
      </View>

      {/* Controles */}
      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <Controls
          started={started}
          running={running}
          completed={completed}
          waitingForNext={waitingForNext}
          onStart={pomodoro.start}
          onPause={pomodoro.pause}
          onReset={handleReset}
        />
      </View>

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Chuva de grãos de café */}
      <CoffeeConfetti
        visible={showConfetti}
        onDone={() => setShowConfetti(false)}
      />

      {/* Toast de conquista (sempre visível no emulador) */}
      {toastAchievement && (
        <View style={[styles.toast, { top: insets.top + 60 }]} pointerEvents="none">
          <Text style={styles.toastTitle}>🏆 Conquista desbloqueada!</Text>
          <Text style={styles.toastName}>{toastAchievement.name}</Text>
          <Text style={styles.toastDesc}>{toastAchievement.description}</Text>
        </View>
      )}
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: 'rgba(244,236,225,0.03)',
  },
  chipText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11, letterSpacing: 2.5,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(244,236,225,0.03)',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a120b',
  },
  avatarText: { color: colors.amber, fontSize: 15, fontWeight: '600' },
  cup: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  taskInput: {
    color: colors.cream,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginBottom: 4,
    opacity: 0.75,
    minWidth: 200,
  },
  toast: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: '#1a120b',
    borderWidth: 1, borderColor: colors.amber + '88',
    borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 14,
    gap: 4,
    shadowColor: colors.amber,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  toastTitle: {
    fontSize: 12, fontWeight: '700',
    color: colors.amber, letterSpacing: 0.5,
  },
  toastName: {
    fontSize: 16, fontWeight: '700',
    color: colors.cream,
  },
  toastDesc: {
    fontSize: 12.5, color: colors.muted, lineHeight: 17,
  },
});
