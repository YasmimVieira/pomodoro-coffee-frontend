import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withDelay, withSequence, Easing,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { CoffeeCup } from '../components/CoffeeCup';

const { colors } = theme;

// Ponto pulsante (animação de loading)
function Dot({ i }: { i: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      i * 200,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 400 }),
          withTiming(1,   { duration: 400 })
        ),
        -1
      )
    );
  }, [scale, i]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.5 + (scale.value - 1) * 0.8,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  // Auto-avança após 2.6s; toque adianta
  useEffect(() => {
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <Pressable onPress={onDone} style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        locations={[0, 0.52, 1]}
        style={styles.fill}
      >
        <View style={styles.center}>
          <Animated.View entering={FadeIn.duration(800)}>
            <CoffeeCup fill={0.6} showSteam completed={false} />
          </Animated.View>

          <Animated.Text
            entering={FadeIn.delay(300).duration(600)}
            style={styles.brand}
          >
            Pomodoro Coffee
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(500).duration(600)}
            style={styles.tag}
          >
            FOCO, GOLE A GOLE
          </Animated.Text>
        </View>

        <View style={styles.dots}>
          {[0, 1, 2].map(i => <Dot key={i} i={i} />)}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: {
    fontSize: 26, fontWeight: '600',
    color: colors.cream, letterSpacing: 0.5, marginTop: 4,
  },
  tag: {
    fontFamily: theme.fonts.mono,
    fontSize: 11, letterSpacing: 3,
    color: colors.amber, marginTop: 8,
  },
  dots: {
    position: 'absolute', bottom: 64,
    alignSelf: 'center', flexDirection: 'row', gap: 7,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.amber,
  },
});