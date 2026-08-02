import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// TODO(Codex, Day 1): این اسکرین‌ها را در src/screens/ بساز.
// هر اسکرین باید از useTranslation() برای همه متن‌ها استفاده کند - هیچ متن hardcoded نباشد.
import OnboardingScreen from '../screens/OnboardingScreen';
import ConsentDeclinedScreen from '../screens/ConsentDeclinedScreen';
import ConsentScreen from '../screens/ConsentScreen';
import CheckInScreen from '../screens/CheckInScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useConsentStore } from '../store/consentStore';

export type RootStackParamList = {
  Onboarding: undefined;
  Consent: undefined;
  ConsentDeclined: undefined;
  CheckIn: undefined;
  MeditationPlayer: { meditationId: string };
  Library: undefined;
  Paywall: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const consentGiven = useConsentStore((state) => state.consentGiven);
  const hasHydrated = useConsentStore((state) => state.hasHydrated);
  const hydrateConsent = useConsentStore((state) => state.hydrateConsent);

  useEffect(() => {
    void hydrateConsent();
  }, [hydrateConsent]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={consentGiven === true ? 'CheckIn' : 'Onboarding'}
      screenOptions={{ headerShown: false }}
    >
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
