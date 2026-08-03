import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { useConsentStore } from '../store/consentStore';
import { colors } from '../theme/colors';

type ConsentScreenProps = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export default function ConsentScreen({ navigation }: ConsentScreenProps) {
  const { t } = useTranslation();
  const setConsent = useConsentStore((state) => state.setConsent);

  const acceptConsent = async () => {
    await setConsent(true);
    navigation.replace('CheckIn');
  };

  const declineConsent = async () => {
    await setConsent(false);
    navigation.replace('ConsentDeclined');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>{t('consent.health_data_title')}</Text>
          <Text style={styles.body}>{t('consent.health_data_body')}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void acceptConsent()}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>{t('consent.accept')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => void declineConsent()}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.secondaryButtonText}>{t('consent.decline')}</Text>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  copy: {
    marginBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 18,
  },
  body: {
    color: colors.mutedText,
    fontSize: 17,
    lineHeight: 26,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 14,
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
});
