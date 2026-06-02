import React from 'react';
import Svg, { Path, Ellipse, Rect, Circle, G, Line } from 'react-native-svg';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requiredCycles: number;
  color: string;
  icon: (size: number, color: string) => React.ReactElement;
}

// ─── Ícones SVG ───────────────────────────────────────────────────────────────

// 1. Café Expresso — xícara demitasse pequena com pires
const EspressoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // pires
    React.createElement(Ellipse, { cx: 20, cy: 32, rx: 13, ry: 3, fill: 'none', stroke: c, strokeWidth: 1.8 }),
    // corpo da xícara (trapézio)
    React.createElement(Path, { d: 'M13 16 L27 16 L24.5 29 L15.5 29 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // borda superior
    React.createElement(Ellipse, { cx: 20, cy: 16, rx: 7, ry: 2, fill: c + '44', stroke: c, strokeWidth: 1.5 }),
    // café dentro
    React.createElement(Ellipse, { cx: 20, cy: 17, rx: 5.5, ry: 1.5, fill: c }),
  );

// 2. Café Coado — V60 / dripper com filtro
const CoadoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // cone do dripper
    React.createElement(Path, { d: 'M10 8 L30 8 L22 28 L18 28 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // linhas do filtro de papel
    React.createElement(Line, { x1: 15, y1: 13, x2: 21, y2: 26, stroke: c, strokeWidth: 1, opacity: 0.6 }),
    React.createElement(Line, { x1: 20, y1: 10, x2: 20, y2: 27, stroke: c, strokeWidth: 1, opacity: 0.6 }),
    React.createElement(Line, { x1: 25, y1: 13, x2: 19, y2: 26, stroke: c, strokeWidth: 1, opacity: 0.6 }),
    // suporte
    React.createElement(Path, { d: 'M14 28 L26 28 L24 32 L16 32 Z', fill: 'none', stroke: c, strokeWidth: 1.8 }),
    // gota caindo
    React.createElement(Path, { d: 'M20 33 Q20.8 35 20 37 Q19.2 35 20 33 Z', fill: c }),
  );

// 3. Café com Leite — canecão com swirl de leite
const ComLeiteIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // corpo da caneca
    React.createElement(Rect, { x: 8, y: 12, width: 22, height: 20, rx: 4, fill: c + '22', stroke: c, strokeWidth: 1.8 }),
    // alça
    React.createElement(Path, { d: 'M30 16 Q37 16 37 22 Q37 28 30 28', fill: 'none', stroke: c, strokeWidth: 1.8, strokeLinecap: 'round' }),
    // borda superior
    React.createElement(Rect, { x: 8, y: 11, width: 22, height: 4, rx: 2, fill: c + '55', stroke: c, strokeWidth: 1.5 }),
    // swirl de leite
    React.createElement(Path, { d: 'M13 22 Q17 18 21 22 Q25 26 29 22', fill: 'none', stroke: c, strokeWidth: 2, strokeLinecap: 'round', opacity: 0.9 }),
  );

// 4. Cappuccino — xícara redonda com espuma
const CappuccinoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // pires
    React.createElement(Ellipse, { cx: 20, cy: 33, rx: 14, ry: 3, fill: 'none', stroke: c, strokeWidth: 1.8 }),
    // xícara
    React.createElement(Path, { d: 'M9 18 Q9 30 20 30 Q31 30 31 18 Z', fill: c + '22', stroke: c, strokeWidth: 1.8 }),
    // alça
    React.createElement(Path, { d: 'M31 20 Q37 20 37 24 Q37 28 31 28', fill: 'none', stroke: c, strokeWidth: 1.8, strokeLinecap: 'round' }),
    // espuma (dome)
    React.createElement(Ellipse, { cx: 20, cy: 18, rx: 11, ry: 5, fill: c + '55', stroke: c, strokeWidth: 1.8 }),
    // swirl de espuma
    React.createElement(Path, { d: 'M15 18 Q18 15 20 18 Q22 21 25 18', fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', opacity: 0.8 }),
  );

// 5. Café Pingado — expresso com gota de leite
const PingadoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // xícara pequena
    React.createElement(Path, { d: 'M12 20 L28 20 L26 30 L14 30 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    React.createElement(Ellipse, { cx: 20, cy: 20, rx: 8, ry: 2.5, fill: c + '44', stroke: c, strokeWidth: 1.5 }),
    // pires
    React.createElement(Ellipse, { cx: 20, cy: 32, rx: 12, ry: 2.5, fill: 'none', stroke: c, strokeWidth: 1.8 }),
    // gota de leite caindo
    React.createElement(Path, { d: 'M20 8 Q21.5 11 21.5 13 Q21.5 16.5 20 16.5 Q18.5 16.5 18.5 13 Q18.5 11 20 8 Z', fill: c, opacity: 0.85 }),
    // impacto
    React.createElement(Path, { d: 'M16 18 Q18 16 20 17 Q22 16 24 18', fill: 'none', stroke: c, strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.7 }),
  );

// 6. Macchiato — copo com camadas (expresso + espuma)
const MacchiatoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // copo
    React.createElement(Path, { d: 'M12 8 L28 8 L26 34 L14 34 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // camada de espresso (fundo, mais escura)
    React.createElement(Path, { d: 'M14.8 26 L25.2 26 L26 34 L14 34 Z', fill: c + '66' }),
    // linha de separação leite/expresso
    React.createElement(Line, { x1: 14.5, y1: 26, x2: 25.5, y2: 26, stroke: c, strokeWidth: 1.5 }),
    // espuma no topo
    React.createElement(Ellipse, { cx: 20, cy: 9.5, rx: 8, ry: 3, fill: c + '55', stroke: c, strokeWidth: 1.5 }),
  );

// 7. Flat White — xícara rasa e larga
const FlatWhiteIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // pires largo
    React.createElement(Ellipse, { cx: 20, cy: 32, rx: 16, ry: 3.5, fill: 'none', stroke: c, strokeWidth: 1.8 }),
    // xícara bem rasa e larga
    React.createElement(Path, { d: 'M7 19 Q7 29 20 29 Q33 29 33 19 Z', fill: c + '22', stroke: c, strokeWidth: 1.8 }),
    // alça pequena
    React.createElement(Path, { d: 'M33 21 Q38 21 38 24 Q38 27 33 27', fill: 'none', stroke: c, strokeWidth: 1.8, strokeLinecap: 'round' }),
    // superfície plana com micro-foam (espiral discreta)
    React.createElement(Ellipse, { cx: 20, cy: 19, rx: 13, ry: 4, fill: c + '44', stroke: c, strokeWidth: 1.5 }),
    React.createElement(Circle, { cx: 20, cy: 19, r: 4, fill: 'none', stroke: c, strokeWidth: 1, opacity: 0.6 }),
    React.createElement(Circle, { cx: 20, cy: 19, r: 2, fill: c, opacity: 0.5 }),
  );

// 8. Cold Brew — copo alto com gelo e canudo
const ColdBrewIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // copo alto (levemente cônico)
    React.createElement(Path, { d: 'M12 6 L28 6 L26 36 L14 36 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // cubos de gelo
    React.createElement(Rect, { x: 15, y: 10, width: 7, height: 6, rx: 1.5, fill: c + '55', stroke: c, strokeWidth: 1.2 }),
    React.createElement(Rect, { x: 19, y: 17, width: 6, height: 6, rx: 1.5, fill: c + '55', stroke: c, strokeWidth: 1.2 }),
    React.createElement(Rect, { x: 14, y: 23, width: 6, height: 5, rx: 1.5, fill: c + '55', stroke: c, strokeWidth: 1.2 }),
    // canudo
    React.createElement(Line, { x1: 24, y1: 4, x2: 19, y2: 36, stroke: c, strokeWidth: 2.5, strokeLinecap: 'round' }),
  );

// 9. Affogato — taça com sorvete e espresso
const AffogatoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // taça (V invertido com base)
    React.createElement(Path, { d: 'M10 6 L30 6 L24 28 L16 28 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // base da taça
    React.createElement(Line, { x1: 15, y1: 36, x2: 25, y2: 36, stroke: c, strokeWidth: 2.2, strokeLinecap: 'round' }),
    React.createElement(Line, { x1: 20, y1: 28, x2: 20, y2: 36, stroke: c, strokeWidth: 2, strokeLinecap: 'round' }),
    // bola de sorvete
    React.createElement(Path, { d: 'M13 6 Q13 -2 20 -2 Q27 -2 27 6 Z', fill: c + '77', stroke: c, strokeWidth: 1.8 }),
    // fio de espresso em cima do sorvete
    React.createElement(Path, { d: 'M16 2 Q20 5 24 2', fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', opacity: 0.9 }),
  );

// 10. Chá Matte — cuia/cabaça com bomba
const MatteIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // corpo da cuia (cabaça/gourd)
    React.createElement(Path, { d: 'M11 18 Q11 34 20 34 Q29 34 29 18 Q29 10 24 9 Q21 8 18 9 Q11 10 11 18 Z', fill: c + '22', stroke: c, strokeWidth: 1.8 }),
    // gargalo estreito do topo
    React.createElement(Path, { d: 'M16 9 Q16 5 20 5 Q24 5 24 9', fill: c + '44', stroke: c, strokeWidth: 1.5 }),
    // bomba (metal straw) diagonal
    React.createElement(Line, { x1: 20, y1: 3, x2: 25, y2: 30, stroke: c, strokeWidth: 2.5, strokeLinecap: 'round' }),
    // filtro da bomba (bolinha na ponta)
    React.createElement(Circle, { cx: 25.5, cy: 31, r: 2.5, fill: c, stroke: c, strokeWidth: 1 }),
    // líquido matte
    React.createElement(Ellipse, { cx: 20, cy: 20, rx: 7, ry: 3, fill: c + '55', opacity: 0.6 }),
  );

// 11. Irish Coffee — taça com creme chantilly
const IrishIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // copo com pé (goblet)
    React.createElement(Path, { d: 'M11 8 L29 8 L26 26 L22 26 L22 32 L26 32 L26 35 L14 35 L14 32 L18 32 L18 26 L14 26 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // camada de café
    React.createElement(Path, { d: 'M14 26 L26 26 L24.5 16 L15.5 16 Z', fill: c + '55' }),
    // creme (chantilly) no topo — dome
    React.createElement(Path, { d: 'M11 8 Q15 0 20 0 Q25 0 29 8 Z', fill: c + '88', stroke: c, strokeWidth: 1.5 }),
    // linha separando creme do café
    React.createElement(Line, { x1: 11, y1: 8, x2: 29, y2: 8, stroke: c, strokeWidth: 1.5 }),
  );

// 12. Café Turco — cezve com cabo longo
const TurcoIcon = (s: number, c: string) =>
  React.createElement(Svg, { width: s, height: s, viewBox: '0 0 40 40' },
    // corpo do cezve (bule turco) — largo embaixo, estreito no meio, ligeiro alargamento no topo
    React.createElement(Path, { d: 'M10 32 Q10 18 15 16 L13 14 Q13 8 20 8 Q27 8 27 14 L25 16 Q30 18 30 32 Z', fill: c + '22', stroke: c, strokeWidth: 1.8, strokeLinejoin: 'round' }),
    // cabo longo horizontal
    React.createElement(Path, { d: 'M30 22 Q40 20 40 24 Q40 26 30 26', fill: 'none', stroke: c, strokeWidth: 2, strokeLinecap: 'round' }),
    // espuma/superfície
    React.createElement(Ellipse, { cx: 20, cy: 14, rx: 7, ry: 2.5, fill: c + '66', stroke: c, strokeWidth: 1.5 }),
    // vapor saindo
    React.createElement(Path, { d: 'M17 9 Q16 6 17 4', fill: 'none', stroke: c, strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.6 }),
    React.createElement(Path, { d: 'M20 8 Q19 5 20 3', fill: 'none', stroke: c, strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.6 }),
    React.createElement(Path, { d: 'M23 9 Q22 6 23 4', fill: 'none', stroke: c, strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.6 }),
  );

// ─── Definição das conquistas ─────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'expresso',
    name: 'Café Expresso',
    description: 'Primeira dose de foco. Concentrado e direto.',
    requiredCycles: 1,
    color: '#7B3F10',
    icon: EspressoIcon,
  },
  {
    id: 'coado',
    name: 'Café Coado',
    description: 'Paciência e processo. O foco filtra as distrações.',
    requiredCycles: 3,
    color: '#8B5E3C',
    icon: CoadoIcon,
  },
  {
    id: 'comleite',
    name: 'Café com Leite',
    description: 'Equilíbrio entre intensidade e suavidade.',
    requiredCycles: 5,
    color: '#C8894E',
    icon: ComLeiteIcon,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Foco com espuma. Você está ganhando ritmo.',
    requiredCycles: 10,
    color: '#D2691E',
    icon: CappuccinoIcon,
  },
  {
    id: 'pingado',
    name: 'Café Pingado',
    description: 'Cada gota conta. Consistência em construção.',
    requiredCycles: 15,
    color: '#A0522D',
    icon: PingadoIcon,
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    description: 'Intensidade com toque de leveza. Produtivo.',
    requiredCycles: 25,
    color: '#8B4513',
    icon: MacchiatoIcon,
  },
  {
    id: 'flatwhite',
    name: 'Flat White',
    description: 'Suavidade e precisão. Foco refinado.',
    requiredCycles: 40,
    color: '#C8A882',
    icon: FlatWhiteIcon,
  },
  {
    id: 'coldbrew',
    name: 'Cold Brew',
    description: 'Preparado com calma. Resultado que vale a espera.',
    requiredCycles: 60,
    color: '#3E2010',
    icon: ColdBrewIcon,
  },
  {
    id: 'affogato',
    name: 'Affogato',
    description: 'Foco tão sólido que derrete obstáculos.',
    requiredCycles: 90,
    color: '#E0A766',
    icon: AffogatoIcon,
  },
  {
    id: 'matte',
    name: 'Chá Matte',
    description: 'Energia sustentada. Foco que vem da raiz.',
    requiredCycles: 120,
    color: '#5A7A1E',
    icon: MatteIcon,
  },
  {
    id: 'irish',
    name: 'Irish Coffee',
    description: 'Campeão de constância. O creme da produtividade.',
    requiredCycles: 175,
    color: '#2D5A27',
    icon: IrishIcon,
  },
  {
    id: 'turco',
    name: 'Café Turco',
    description: 'Lenda do foco. Tradição, força e domínio total.',
    requiredCycles: 250,
    color: '#8B0000',
    icon: TurcoIcon,
  },
];
