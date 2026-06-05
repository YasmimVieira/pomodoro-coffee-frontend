import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CupMark } from '../components/CoffeeCup';
import { useAuth } from '../state/AuthContext';
import { theme } from '../constants/theme';

const { colors } = theme;

function Field({
  label, value, onChange, secure, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  secure?: boolean; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        secureTextEntry={secure}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { borderColor: focused ? colors.amber : colors.line }]}
      />
    </View>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pw) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, pw);
      } else {
        await register(email, pw, name || email.split('@')[0]);
      }
      onLogin();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? t('login.checkData');
      Alert.alert(t('login.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        locations={[0, 0.52, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.brandWrap}>
            <CupMark size={46} />
            <Text style={styles.title}>
              {mode === 'login' ? t('login.welcomeBack') : t('login.createAccount')}
            </Text>
            <Text style={styles.sub}>
              {mode === 'login' ? t('login.focusContinue') : t('login.focusStart')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={{ gap: 16, marginTop: 34 }}>
            {mode === 'register' && (
              <Field label={t('login.name')} value={name} onChange={setName} placeholder={t('login.namePlaceholder')} />
            )}
            <Field label={t('login.email')} value={email} onChange={setEmail} placeholder={t('login.emailPlaceholder')} />
            <Field label={t('login.password')} value={pw} onChange={setPw} secure placeholder={t('login.passwordPlaceholder')} />

            {mode === 'login' && (
              <Text style={styles.forgot}>{t('login.forgotPassword')}</Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.primary, { opacity: pressed || loading ? 0.8 : 1 }]}
            >
              {loading
                ? <ActivityIndicator color={colors.onAmber} />
                : <Text style={styles.primaryText}>
                    {mode === 'login' ? t('login.enter') : t('login.createAccount')}
                  </Text>
              }
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ marginTop: 'auto', paddingTop: 24, alignItems: 'center' }}
          >
            <Text style={styles.footer}>
              {mode === 'login' ? t('login.noAccount') : t('login.hasAccount')}{' '}
              <Text style={{ color: colors.amber, fontWeight: '600' }}>
                {mode === 'login' ? t('login.createAccount') : t('login.enter')}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 64, paddingBottom: 30 },
  brandWrap: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: colors.cream, marginTop: 14 },
  sub: { fontSize: 14, color: colors.muted, marginTop: 6 },
  fieldLabel: { fontSize: 12, color: colors.muted, paddingLeft: 2 },
  input: {
    backgroundColor: 'rgba(244,236,225,0.05)',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 15,
    color: colors.cream, fontSize: 15,
  },
  forgot: { textAlign: 'right', fontSize: 12.5, color: colors.amber, marginTop: -4 },
  primary: {
    marginTop: 6, paddingVertical: 16, borderRadius: 16,
    backgroundColor: colors.amberLight, alignItems: 'center',
  },
  primaryText: { color: colors.onAmber, fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 13.5, color: colors.muted },
});
