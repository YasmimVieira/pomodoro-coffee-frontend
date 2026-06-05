import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSettings, FOCUS_OPTIONS, BREAK_OPTIONS } from '../state/SettingsContext';
import { theme } from '../constants/theme';

const { colors } = theme;

function OptionRow({ label, options, selected, onSelect }: {
  label: string; options: number[]; selected: number; onSelect: (v: number) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.pills}>
        {options.map(opt => {
          const active = opt === selected;
          return (
            <Pressable key={opt} onPress={() => onSelect(opt)} style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}m</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { focusMin, breakMin, setFocusMin, setBreakMin } = useSettings();
  const totalMin = focusMin * 2 + breakMin * 2;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.total}>{t('settings.totalCycle', { min: totalMin })}</Text>
          <OptionRow label={t('settings.focus')} options={FOCUS_OPTIONS} selected={focusMin} onSelect={setFocusMin} />
          <OptionRow label={t('settings.pause')} options={BREAK_OPTIONS} selected={breakMin} onSelect={setBreakMin} />
          <Pressable onPress={onClose} style={styles.btn}>
            <Text style={styles.btnText}>{t('settings.save')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#1a120b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 20 },
  title: { color: colors.cream, fontSize: 17, fontWeight: '600', marginBottom: 4 },
  total: { color: colors.muted, fontSize: 13, marginBottom: 24 },
  section: { marginBottom: 22 },
  sectionLabel: { fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: 2.5, color: colors.muted, marginBottom: 12 },
  pills: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(244,236,225,0.03)' },
  pillActive: { backgroundColor: colors.amberLight, borderColor: colors.amberLight },
  pillText: { color: colors.muted, fontSize: 14, fontWeight: '500' },
  pillTextActive: { color: colors.onAmber },
  btn: { marginTop: 8, paddingVertical: 16, borderRadius: 16, backgroundColor: colors.amberLight, alignItems: 'center', marginBottom: 8 },
  btnText: { color: colors.onAmber, fontSize: 16, fontWeight: '600' },
});
