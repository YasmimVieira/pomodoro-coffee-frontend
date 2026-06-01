import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { formatMMSS } from '../constants/phases';
import type { PomodoroState } from '../state/usePomodoro';

const isIOS = Platform.OS === 'ios';
const bridge = isIOS ? NativeModules.WatchBridge : null;
const emitter = bridge ? new NativeEventEmitter(bridge) : null;

// Envia estado atual do timer para o Apple Watch
export function sendTimerStateToWatch(state: PomodoroState) {
  if (!bridge) return;

  bridge.sendState({
    phaseLabel:    state.phase.label,
    phaseSub:      state.phase.sub,
    timeString:    formatMMSS(state.remaining),
    phaseProgress: state.remaining / state.phase.duration,
    running:       state.running,
  });
}

// Escuta comandos enviados pelo Watch (play/pause)
// Retorna função de cleanup para usar em useEffect
export function onWatchAction(callback: (action: 'start' | 'pause') => void) {
  if (!emitter) return () => {};

  const sub = emitter.addListener('watchAction', callback);
  return () => sub.remove();
}
