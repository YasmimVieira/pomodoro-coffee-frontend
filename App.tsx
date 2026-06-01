import React, { useEffect, useState } from 'react';
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
import { setupChannel, requestPermissions } from './src/utils/notifications';

SplashScreenExpo.preventAutoHideAsync();

type Screen = 'splash' | 'login' | 'timer' | 'profile';

function AppContent() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>('splash');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Carregue as fontes Geist (baixe de fonts.google.com/specimen/Geist)
        await Font.loadAsync({
          GeistMono: require('./assets/fonts/GeistMono-Regular.ttf'),
          Geist:     require('./assets/fonts/Geist-Regular.ttf'),
        });
        await setupChannel();
        await requestPermissions();
      } finally {
        setReady(true);
        SplashScreenExpo.hideAsync();
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
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