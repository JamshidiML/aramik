import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// TODO(Codex, Day 1): این اسکرین‌ها را در src/screens/ بساز.
// هر اسکرین باید از useTranslation() برای همه متن‌ها استفاده کند - هیچ متن hardcoded نباشد.
import OnboardingScreen from '../screens/OnboardingScreen';
import CheckInScreen from '../screens/CheckInScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  CheckIn: undefined;
  MeditationPlayer: { meditationId: string; script: string };
  Library: undefined;
  Paywall: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
