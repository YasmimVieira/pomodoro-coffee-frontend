import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { type Achievement } from '../constants/achievements';
import { theme } from '../constants/theme';

const { colors } = theme;
const LOCKED_COLOR = 'rgba(244,236,225,0.18)';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
  index?: number;
  onPress?: () => void;
}

export function AchievementBadge({ achievement, unlocked, index = 0, onPress }: Props) {
  const { t } = useTranslation();
  const iconColor = unlocked ? achievement.color : LOCKED_COLOR;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.badge,
          unlocked ? { borderColor: achievement.color + '55' } : styles.badgeLocked,
        ]}
      >
        {/* Ícone */}
        <View style={[styles.iconWrap, unlocked && { backgroundColor: achievement.color + '18' }]}>
          {achievement.icon(36, iconColor)}
        </View>

        {/* Nome */}
        <Text style={[styles.name, { color: unlocked ? colors.cream : colors.muted }]} numberOfLines={2}>
          {t(`achievements.${achievement.id}.name`)}
        </Text>
        <Text style={styles.req}>
          {achievement.requiredCycles} {t('profile.cycles_label')}
        </Text>

        {/* Cadeado se bloqueado */}
        {!unlocked && (
          <Text style={styles.lock}>🔒</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 102,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  badgeLocked: {
    borderColor: colors.line,
    opacity: 0.6,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  req: {
    fontFamily: theme.fonts.mono,
    fontSize: 9.5,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  lock: {
    fontSize: 10,
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
