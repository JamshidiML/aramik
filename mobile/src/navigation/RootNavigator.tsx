import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/OnboardingScreen';
import ConsentDeclinedScreen from '../screens/ConsentDeclinedScreen';
import ConsentScreen from '../screens/ConsentScreen';
import CheckInScreen from '../screens/CheckInScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { useAuthStore } from '../store/authStore';
import { useConsentStore } from '../store/consentStore';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  Consent: undefined;
  ConsentDeclined: undefined;
  CheckIn: undefined;
  MeditationPlayer: { meditationId: string; script: string };
  Library: undefined;
  Paywall: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function resolveInitialRouteName(
  accessToken: string | null,
  consentGiven: boolean | null,
): keyof RootStackParamList {
  if (accessToken === null) {
    return 'SignIn';
  }
  return consentGiven === true ? 'CheckIn' : 'Onboarding';
}

export default function RootNavigator() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const consentGiven = useConsentStore((state) => state.consentGiven);
  const hasConsentHydrated = useConsentStore((state) => state.hasHydrated);
  const hydrateConsent = useConsentStore((state) => state.hydrateConsent);

  useEffect(() => {
    void hydrateAuth();
    void hydrateConsent();
  }, [hydrateAuth, hydrateConsent]);

  if (!hasAuthHydrated || !hasConsentHydrated) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={resolveInitialRouteName(accessToken, consentGiven)}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen name="ConsentDeclined" component={ConsentDeclinedScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
