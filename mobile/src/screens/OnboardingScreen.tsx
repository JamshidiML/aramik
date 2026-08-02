import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { useConsentStore } from '../store/consentStore';
import { colors } from '../theme/colors';

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const consentGiven = useConsentStore((state) => state.consentGiven);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View accessible={false} style={styles.markOuter}>
          <View style={styles.markInner} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{t('onboarding.welcome_title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome_subtitle')}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate(consentGiven === true ? 'CheckIn' : 'Consent')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.get_started')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  markOuter: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 72,
    height: 144,
    justifyContent: 'center',
    marginBottom: 42,
    width: 144,
  },
  markInner: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
    borderRadius: 34,
    borderWidth: 8,
    height: 68,
    width: 68,
  },
  copy: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 320,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 16,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
