import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs, LinearGradient, Stop, ClipPath,
  Path, Rect, Ellipse, RadialGradient,
} from 'react-native-svg';
import { theme } from '../constants/theme';
import { Steam } from './Steam';

// Geometria: o líquido vai de y=236 (vazio) até y=84 (cheio)
const TOP   = theme.cup.liquidTop;    // 84
const BOT   = theme.cup.liquidBottom; // 236
const RANGE = BOT - TOP;              // 152

interface Props {
  fill: number;       // 0..1 — vindo de fillForElapsed()
  showSteam: boolean; // exibir fumaça?
  completed: boolean; // exibir glow de conclusão?
  idle?: boolean;     // xícara parada, sem animação
}

export function CoffeeCup({ fill, showSteam, completed, idle = false }: Props) {
  // Calcula as posições SVG direto do fill (atualiza a cada 100ms pelo timer)
  const liquidY      = BOT - fill * RANGE;
  const liquidHeight = BOT - liquidY + 12;
  const surfaceCy    = liquidY;
  const surfaceRx    = 50 + fill * 12;
  const surfaceOpacity = fill > 0.004 ? 0.92 : 0;
  const cremaCy      = liquidY - 0.5;
  const cremaRx      = 42 + fill * 12;
  const cremaOpacity = fill > 0.004 ? 0.7 : 0;

  const { colors } = theme;

  return (
    <View style={styles.wrap}>
      {/* Fumaça — aparece nas pausas e na conclusão */}
      {showSteam && <Steam strong={completed} />}

      <Svg width={240} height={300} viewBox="0 0 240 300">
        <Defs>
          {/* Gradiente do café: marrom claro (topo) → quase preto (fundo) */}
          <LinearGradient id="coffee" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={colors.espressoTop}  />
            <Stop offset="14%"  stopColor={colors.espressoMid}  />
            <Stop offset="55%"  stopColor={colors.espressoLow}  />
            <Stop offset="100%" stopColor={colors.espressoDeep} />
          </LinearGradient>

          {/* Gradiente do vidro: reflexo lateral esquerdo */}
          <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="rgba(255,255,255,0.16)" />
            <Stop offset="22%"  stopColor="rgba(255,255,255,0.03)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </LinearGradient>

          {/* Glow âmbar — aparece quando o ciclo completa */}
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"  stopColor="rgba(224,167,102,0.45)" />
            <Stop offset="68%" stopColor="rgba(224,167,102,0)"    />
          </RadialGradient>

          {/* ClipPath = formato interno da xícara */}
          {/* Qualquer coisa dentro deste clip fica "dentro da xícara" */}
          <ClipPath id="cupInner">
            <Path d="M62,80 L178,80 L166,224 Q162,240 148,240 L92,240 Q78,240 74,224 Z" />
          </ClipPath>
        </Defs>

        {/* Glow de fundo quando completo */}
        {completed && (
          <Ellipse cx={120} cy={150} rx={100} ry={95} fill="url(#glow)" />
        )}

        {/* Sombra embaixo (pires) */}
        <Ellipse cx={120} cy={270} rx={92} ry={13} fill="rgba(0,0,0,0.5)" />
        <Ellipse
          cx={120} cy={266} rx={86} ry={11}
          fill="rgba(244,236,225,0.06)"
          stroke="rgba(244,236,225,0.14)"
          strokeWidth={1.2}
        />

        {/* Alça */}
        <Path
          d="M178,108 C 220,104 224,180 176,186"
          fill="none"
          stroke="rgba(244,236,225,0.22)"
          strokeWidth={11}
          strokeLinecap="round"
        />

        {/* Corpo de vidro (semitransparente) */}
        <Path
          d="M58,76 L182,76 L169,226 Q165,244 149,244 L91,244 Q75,244 71,226 Z"
          fill="url(#glass)"
        />

        {/* ── LÍQUIDO ── */}
        <Rect
          clipPath="url(#cupInner)"
          x={56} width={128}
          y={liquidY} height={liquidHeight}
          fill="url(#coffee)"
        />

        {/* Superfície escura do café */}
        <Ellipse
          clipPath="url(#cupInner)"
          cx={120} cy={surfaceCy} rx={surfaceRx} ry={6.5}
          fill="#9A6438"
          opacity={surfaceOpacity}
        />

        {/* Crema (espuma clara) */}
        <Ellipse
          clipPath="url(#cupInner)"
          cx={120} cy={cremaCy} rx={cremaRx} ry={3.6}
          fill={colors.crema}
          opacity={cremaOpacity}
        />

        {/* Contorno da xícara */}
        <Path
          d="M58,76 L182,76 L169,226 Q165,244 149,244 L91,244 Q75,244 71,226 Z"
          fill="none"
          stroke="rgba(244,236,225,0.5)"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />

        {/* Aro superior */}
        <Ellipse
          cx={120} cy={78} rx={62} ry={9}
          fill="none"
          stroke="rgba(244,236,225,0.55)"
          strokeWidth={2.4}
        />

        {/* Reflexo lateral */}
        <Path
          d="M76,92 Q70,150 84,214"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// Versão mini da xícara (ícone no histórico)
export function CupMark({ size = 28, fill = 0.62 }: { size?: number; fill?: number }) {
  const sy  = BOT - fill * RANGE;
  const uid = `cm${size}_${Math.round(fill * 100)}`;

  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 240 300">
      <Defs>
        <ClipPath id={uid}>
          <Path d="M62,80 L178,80 L166,224 Q162,240 148,240 L92,240 Q78,240 74,224 Z" />
        </ClipPath>
        <LinearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={theme.colors.espressoTop}  />
          <Stop offset="100%" stopColor={theme.colors.espressoDeep} />
        </LinearGradient>
      </Defs>
      <Path
        d="M178,108 C 220,104 224,180 176,186"
        fill="none" stroke="rgba(244,236,225,0.3)"
        strokeWidth={11} strokeLinecap="round"
      />
      <Rect
        clipPath={`url(#${uid})`}
        x={56} width={128}
        y={sy} height={BOT - sy + 10}
        fill={`url(#${uid}g)`}
      />
      <Ellipse cx={120} cy={sy} rx={56} ry={6} fill="#9A6438" opacity={0.9} />
      <Path
        d="M58,76 L182,76 L169,226 Q165,244 149,244 L91,244 Q75,244 71,226 Z"
        fill="none" stroke="rgba(244,236,225,0.55)"
        strokeWidth={3} strokeLinejoin="round"
      />
      <Ellipse
        cx={120} cy={78} rx={62} ry={9}
        fill="none" stroke="rgba(244,236,225,0.6)" strokeWidth={3}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 240, height: 300, alignItems: 'center', justifyContent: 'center' },
});
