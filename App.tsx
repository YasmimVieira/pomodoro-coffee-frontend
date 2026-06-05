import './src/i18n';
import { loadSavedLanguage } from './src/i18n';
import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreenExpo from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { HistoryProvider } from './src/state/HistoryContext';
import { SettingsProvider } from './src/state/SettingsContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationPermissionModal } from './src/components/NotificationPermissionModal';
import {
  setupChannel,
  requestPermissions,
  getPermissionStatus,
  scheduleRetentionNotification,
} from './src/utils/notifications';

SplashScreenExpo.preventAutoHideAsync();

type Screen = 'splash' | 'login' | 'timer' | 'profile';

function AppContent() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>('splash');
  const [ready, setReady] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          Font.loadAsync({
            GeistMono: require('./assets/fonts/GeistMono-Regular.ttf'),
            Geist:     require('./assets/fonts/Geist-Regular.ttf'),
          }),
          loadSavedLanguage(),
        ]);
        await setupChannel();

        const status = await getPermissionStatus();
        if (status === 'undetermined') {
          setShowPermissionModal(true);
        } else if (status === 'granted') {
          scheduleRetentionNotification();
        }
      } finally {
        setReady(true);
        SplashScreenExpo.hideAsync();
      }
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') scheduleRetentionNotification();
    });
    return () => sub.remove();
  }, []);

  const handleActivateNotifications = async () => {
    setShowPermissionModal(false);
    const granted = await requestPermissions();
    if (granted) scheduleRetentionNotification();
  };

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <NotificationPermissionModal
        visible={showPermissionModal}
        onActivate={handleActivateNotifications}
        onDismiss={() => setShowPermissionModal(false)}
      />
      {screen === 'splash' && (
        <SplashScreen onDone={() => setScreen(user ? 'timer' : 'login')} />
      )}
      {screen === 'login' && (
        <LoginScreen onLogin={() => setScreen('timer')} />
      )}
      {screen === 'timer' && (
        <TimerScreen onOpenProfile={() => setScreen('profile')} />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          onBack={() => setScreen('timer')}
          onLogout={() => setScreen('login')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SettingsProvider>
            <HistoryProvider>
              <AppContent />
            </HistoryProvider>
          </SettingsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
