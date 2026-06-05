import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LANG_META, SUPPORTED_LANGS, setLanguage, type Lang } from '../i18n';
import { theme } from '../constants/theme';

const { colors } = theme;

export function LanguagePicker() {
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const currentLang = i18n.language as Lang;
  const currentFlag = LANG_META[currentLang]?.flag ?? '🌐';

  return (
    <>
      {/* Botão com a bandeira atual */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={styles.flag}>{currentFlag}</Text>
      </Pressable>

      {/* Sheet de seleção */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          {SUPPORTED_LANGS.map(lang => {
            const active = lang === currentLang;
            const meta = LANG_META[lang];
            return (
              <Pressable
                key={lang}
                onPress={() => { setLanguage(lang); setOpen(false); }}
                style={({ pressed }) => [styles.row, active && styles.rowActive, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.rowFlag}>{meta.flag}</Text>
                <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                  {meta.label}
                </Text>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(244,236,225,0.03)',
  },
  flag: { fontSize: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#1a120b',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: colors.line,
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center', marginBottom: 16,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 14,
  },
  rowActive: { backgroundColor: 'rgba(244,236,225,0.06)' },
  rowFlag: { fontSize: 26 },
  rowLabel: { flex: 1, fontSize: 16, color: colors.muted, fontWeight: '500' },
  rowLabelActive: { color: colors.cream, fontWeight: '600' },
  check: { fontSize: 16, color: colors.amber },
});
