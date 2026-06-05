import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { CupMark } from '../components/CoffeeCup';
import { AdBanner } from '../components/AdBanner';
import { AchievementBadge } from '../components/AchievementBadge';
import { ACHIEVEMENTS } from '../constants/achievements';
import { rewardedAd } from '../utils/rewardedAd';
import { generateAndShareWeeklyReport } from '../utils/weeklyReport';
import { useHistory, type CycleRecord } from '../state/HistoryContext';
import { useAuth } from '../state/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { theme } from '../constants/theme';

const { colors } = theme;

// ── Helpers ──────────────────────────────────────────────────────────────────

function relDate(ts: number): string {
  const d   = new Date(ts);
  const now = new Date();
  const day   = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff  = Math.round((today - day) / 86400000);
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language;
  const hm    = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `${i18n.t('profile.today')} · ${hm}`;
  if (diff === 1) return `${i18n.t('profile.yesterday')} · ${hm}`;
  if (diff < 7)  return `${d.toLocaleDateString(locale, { weekday: 'long' })} · ${hm}`;
  return `${d.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} · ${hm}`;
}

// ── WeeklyChart ───────────────────────────────────────────────────────────────

const DAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_LABELS_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const DAY_LABELS_MAP: Record<string, string[]> = { pt: DAY_LABELS_PT, en: DAY_LABELS_EN, es: DAY_LABELS_ES, it: DAY_LABELS_IT };

function WeeklyChart({ history }: { history: CycleRecord[] }) {
  const { t } = useTranslation();
  const dayLabels = DAY_LABELS_MAP[i18n.language] ?? DAY_LABELS_PT;
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date   = new Date(today.getTime() - (6 - i) * 86400000);
      const ts     = date.getTime();
      const mins   = history
        .filter(h => h.ts >= ts && h.ts < ts + 86400000)
        .reduce((s, h) => s + h.focusMin, 0);
      return { label: dayLabels[date.getDay()], mins, isToday: i === 6 };
    });
  }, [history]);

  const maxMins  = Math.max(...days.map(d => d.mins), 1);
  const VW       = 300;
  const barH_max = 72;
  const barW     = 28;
  const gap      = (VW - barW * 7) / 8;
  const chartH   = 90;
  const totalH   = chartH + 24;

  return (
    <View style={styles.chartWrap}>
      <Text style={styles.section}>{t('profile.thisWeek')}</Text>
      <Svg
        width="100%"
        height={totalH}
        viewBox={`0 0 ${VW} ${totalH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {days.map((d, i) => {
          const bh  = d.mins > 0 ? Math.max((d.mins / maxMins) * barH_max, 6) : 3;
          const x   = gap + i * (barW + gap);
          const y   = chartH - bh;
          const col = d.isToday
            ? colors.amber
            : d.mins > 0
            ? colors.amberLight
            : colors.line;

          return (
            <React.Fragment key={i}>
              {/* Barra */}
              <Rect
                x={x} y={y} width={barW} height={bh}
                rx={6} fill={col}
                opacity={d.mins > 0 ? 1 : 0.35}
              />
              {/* Minutos acima da barra */}
              {d.mins > 0 && (
                <SvgText
                  x={x + barW / 2} y={y - 5}
                  textAnchor="middle"
                  fontSize={8.5}
                  fill={d.isToday ? colors.amber : colors.cream}
                  opacity={0.75}
                >
                  {d.mins}m
                </SvgText>
              )}
              {/* Rótulo do dia */}
              <SvgText
                x={x + barW / 2} y={chartH + 16}
                textAnchor="middle"
                fontSize={10}
                fill={d.isToday ? colors.amber : colors.muted}
                fontWeight={d.isToday ? '700' : '400'}
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────────────────────

export function ProfileScreen({
  onBack, onLogout,
}: { onBack: () => void; onLogout: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { history } = useHistory();

  const sessions = useMemo(() => history.length, [history]);

  const [reportLoading, setReportLoading] = useState(false);

  const handleLogout = async () => { await logout(); onLogout(); };

  const handleWatchForReport = () => {
    setReportLoading(true);
    rewardedAd.show({
      onReward: async () => {
        try {
          await generateAndShareWeeklyReport(history);
        } catch {
          Alert.alert(t('profile.error'), t('profile.report.error'));
        } finally {
          setReportLoading(false);
        }
      },
      onClose: () => setReportLoading(false),
    });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
      locations={[0, 0.52, 1]}
      style={{ flex: 1 }}
    >
      {/* Navbar */}
      <View style={[styles.nav, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.navBtn}>
          <Svg width={11} height={18} viewBox="0 0 11 18">
            <Path d="M9 1L2 9l7 8" fill="none" stroke={colors.cream}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.navTitle}>{t('profile.title')}</Text>
        <Pressable onPress={handleLogout} style={styles.navBtn}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M7 2H3v14h4M12 5l4 4-4 4M16 9H7" fill="none"
              stroke={colors.muted} strokeWidth={1.7}
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <AdBanner />

        {/* Avatar */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.userRow}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name ?? t('profile.user')}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </Animated.View>

 

     

        {/* Relatório semanal em PDF */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.reportCard}>
          <View style={styles.reportLeft}>
            <Text style={styles.reportTitle}>{t('profile.report.title')}</Text>
            <Text style={styles.reportSub}>{t('profile.report.sub')}</Text>
          </View>
          <Pressable
            onPress={handleWatchForReport}
            disabled={reportLoading}
            style={({ pressed }) => [styles.reportBtn, { opacity: pressed || reportLoading ? 0.7 : 1 }]}
          >
            {reportLoading
              ? <ActivityIndicator size="small" color={colors.onAmber} />
              : <Text style={styles.reportBtnText}>{t('profile.report.watch')}</Text>
            }
          </Pressable>
        </Animated.View>

        {/* Conquistas */}
        <Animated.View entering={FadeInDown.delay(340).duration(500)}>
          <Text style={styles.section}>{t('profile.achievements')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          >
            {ACHIEVEMENTS.map((a, i) => (
              <AchievementBadge
                key={a.id}
                achievement={a}
                unlocked={sessions >= a.requiredCycles}
                index={i}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Histórico */}
        <Text style={styles.section}>{t('profile.history')}</Text>

        {history.length === 0 && (
          <Text style={styles.empty}>{t('profile.empty')}</Text>
        )}

        <View style={{ gap: 9 }}>
          {history.map((h: CycleRecord, i) => (
            <Animated.View
              key={h.ts}
              entering={FadeInDown.delay(i * 40).duration(400)}
              style={styles.histRow}
            >
              <CupMark size={26} fill={1} />
              <View style={{ flex: 1 }}>
                <Text style={styles.histTitle}>{t('profile.cycleComplete')}</Text>
                <Text style={styles.histDate}>{relDate(h.ts)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.histMin}>{h.focusMin}m</Text>
                <Text style={styles.histFoco}>{t('profile.focusLabel')}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingBottom: 4,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: colors.cream },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  bigAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.amberLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bigAvatarText: { color: colors.onAmber, fontSize: 24, fontWeight: '700' },
  name:  { fontSize: 19, fontWeight: '600', color: colors.cream },
  email: { fontSize: 13, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  statCard: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: 18, paddingVertical: 16, alignItems: 'center',
  },
  statValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 26, fontWeight: '500', color: colors.cream,
  },
  statUnit:  { fontSize: 13, color: colors.muted },
  statLabel: { fontSize: 11.5, color: colors.muted, marginTop: 4 },
  chartWrap: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
    marginTop: 14,
  },
  section: {
    fontFamily: theme.fonts.mono,
    fontSize: 11, letterSpacing: 2, color: colors.muted,
    marginTop: 26, marginBottom: 12, paddingLeft: 2,
  },
  empty: { color: colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 30 },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
  },
  histTitle: { fontSize: 14.5, fontWeight: '500', color: colors.cream },
  histDate:  { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  histMin:   { fontFamily: theme.fonts.mono, fontSize: 14, color: colors.amber },
  histFoco:  { fontSize: 11, color: colors.muted, marginTop: 2 },
  reportCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.amber + '44',
    borderRadius: 18, padding: 16, marginTop: 14, gap: 12,
  },
  reportLeft:    { flex: 1, gap: 4 },
  reportTitle:   { fontSize: 15, fontWeight: '600', color: colors.cream },
  reportSub:     { fontSize: 12, color: colors.muted, lineHeight: 17 },
  reportBtn: {
    backgroundColor: colors.amberLight,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 88,
  },
  reportBtnText: { color: colors.onAmber, fontSize: 13, fontWeight: '700' },
});
