import { NativeModules, Platform } from 'react-native';
import { ACHIEVEMENTS } from '../constants/achievements';

const achievementEmojis: Record<string, string> = {
  expresso:   '☕',
  coado:      '☕',
  comleite:   '🥛',
  cappuccino: '☕',
  pingado:    '💧',
  macchiato:  '✨',
  flatwhite:  '⚡',
  coldbrew:   '🧊',
  affogato:   '🍨',
  matte:      '🌿',
  irish:      '🍀',
  turco:      '🏆',
};

export function updateWidget(cycleCount: number, streak: number) {
  try {
    const unlocked = [...ACHIEVEMENTS]
      .reverse()
      .find(a => cycleCount >= a.requiredCycles);

    const achievement = unlocked?.name ?? '—';
    const achievementEmoji = unlocked ? (achievementEmojis[unlocked.id] ?? '☕') : '☕';

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      NativeModules.WidgetModule?.updateWidget(streak, achievement, achievementEmoji);
    }
  } catch {}
}
