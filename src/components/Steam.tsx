import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withDelay, Easing, cancelAnimation,
} from 'react-native-reanimated';

// Um único fio de fumaça
function Wisp({ x, delay, dur }: { x: number; delay: number; dur: number }) {
  const t = useSharedValue(0); // 0 = embaixo, 1 = sumiu no topo

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );
    return () => cancelAnimation(t);
  }, [t, delay, dur]);

  const style = useAnimatedStyle(() => ({
    // Aparece até t=0.35, depois some
    opacity:
      t.value < 0.35
        ? (t.value / 0.35) * 0.55
        : (1 - (t.value - 0.35) / 0.65) * 0.55,
    transform: [
      { translateY: -26 * t.value + 8 }, // sobe 26px
      { scaleX: 0.85 + 0.3 * t.value },  // alarga no topo
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={240} height={70} viewBox="0 0 240 70">
        {/* Curva bezier que dá o formato ondulado da fumaça */}
        <Path
          d={`M${x} 64 C ${x-9} 48 ${x+9} 40 ${x} 24 C ${x-7} 12 ${x+6} 6 ${x} 0`}
          fill="none"
          stroke="rgba(244,236,225,0.5)"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

export function Steam({ strong = false }: { strong?: boolean }) {
  // strong=true → 3 fios (conclusão); false → 2 fios (pausa)
  const positions = strong ? [96, 120, 144] : [108, 132];

  return (
    <Animated.View style={styles.wrap} pointerEvents="none">
      {positions.map((x, i) => (
        <Wisp
          key={x}
          x={x}
          delay={i * 600}         // cada fio começa com atraso
          dur={2800 + i * 500}    // duração levemente diferente
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 6,
    left: 0,
    width: 240,
    height: 70,
  },
});