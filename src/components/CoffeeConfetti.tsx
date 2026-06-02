import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('screen');

const BEAN_COLORS = ['#6B3010', '#8B5E3C', '#4A2010', '#C8894E', '#3E2010', '#A0522D'];
const BEAN_COUNT  = 28;

interface BeanData {
  x: number;
  size: number;
  delay: number;
  duration: number;
  startRotation: number;
  endRotation: number;
  color: string;
  swayX: number;
}

function makeBeans(): BeanData[] {
  return Array.from({ length: BEAN_COUNT }, () => ({
    x:             Math.random() * (W - 20),
    size:          10 + Math.random() * 9,
    delay:         Math.random() * 1000,
    duration:      1600 + Math.random() * 1400,
    startRotation: Math.random() * 180,
    endRotation:   Math.random() * 720 + 360,
    color:         BEAN_COLORS[Math.floor(Math.random() * BEAN_COLORS.length)],
    swayX:         (Math.random() - 0.5) * 80,
  }));
}

function CoffeeBean({ d, active }: { d: BeanData; active: boolean }) {
  const y      = useSharedValue(-60);
  const rotate = useSharedValue(d.startRotation);
  const x      = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    y.value = withDelay(d.delay,
      withTiming(H + 80, { duration: d.duration, easing: Easing.in(Easing.quad) }));
    rotate.value = withDelay(d.delay,
      withTiming(d.startRotation + d.endRotation, { duration: d.duration }));
    x.value = withDelay(d.delay,
      withTiming(d.swayX, { duration: d.duration, easing: Easing.out(Easing.sin) }));
  }, [active]);

  const style = useAnimatedStyle(() => ({
    position:  'absolute' as const,
    left:      d.x + x.value,
    top:       y.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const bw = d.size;
  const bh = d.size * 1.55;

  return (
    <Animated.View style={style} pointerEvents="none">
      <Svg width={bw} height={bh} viewBox="0 0 12 18">
        {/* Corpo do grão */}
        <Ellipse cx="6" cy="9" rx="5.5" ry="8.5" fill={d.color} />
        {/* Vinco central */}
        <Path
          d="M6 1 Q3.2 9 6 17"
          stroke="#2A0E00"
          strokeWidth="1.6"
          fill="none"
          opacity="0.65"
        />
      </Svg>
    </Animated.View>
  );
}

interface Props {
  visible: boolean;
  onDone?: () => void;
}

export function CoffeeConfetti({ visible, onDone }: Props) {
  const beans = useMemo(makeBeans, []);

  // Chama onDone após a última partícula cair
  useEffect(() => {
    if (!visible || !onDone) return;
    const maxMs = Math.max(...beans.map(b => b.delay + b.duration)) + 200;
    const t = setTimeout(onDone, maxMs);
    return () => clearTimeout(t);
  }, [visible, onDone, beans]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {beans.map((b, i) => (
        <CoffeeBean key={i} d={b} active={visible} />
      ))}
    </View>
  );
}
