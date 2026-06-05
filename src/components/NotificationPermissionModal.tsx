import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../constants/theme';

const { colors } = theme;

interface Props {
  visible: boolean;
  onActivate: () => void;
  onDismiss: () => void;
}

export function NotificationPermissionModal({ visible, onActivate, onDismiss }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.title}>{t('notifications.permissionTitle')}</Text>
          <Text style={styles.body}>{t('notifications.permissionBody')}</Text>
          <Pressable style={({ pressed }) => [styles.primary, { opacity: pressed ? 0.8 : 1 }]} onPress={onActivate}>
            <Text style={styles.primaryText}>{t('notifications.activate')}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.6 : 1 }]} onPress={onDismiss}>
            <Text style={styles.secondaryText}>{t('notifications.notNow')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  card: { backgroundColor: '#1a120b', borderRadius: 24, borderWidth: 1, borderColor: colors.line, padding: 28, alignItems: 'center', width: '100%' },
  emoji: { fontSize: 40, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: colors.cream, marginBottom: 10, textAlign: 'center' },
  body: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  primary: { backgroundColor: colors.amberLight, borderRadius: 14, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  primaryText: { color: colors.onAmber, fontSize: 15, fontWeight: '600' },
  secondary: { paddingVertical: 10 },
  secondaryText: { color: colors.muted, fontSize: 14 },
});
