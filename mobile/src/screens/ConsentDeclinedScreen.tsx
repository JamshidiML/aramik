import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type ConsentDeclinedScreenProps = NativeStackScreenProps<RootStackParamList, 'ConsentDeclined'>;

export default function ConsentDeclinedScreen({ navigation }: ConsentDeclinedScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('consent.health_data_title')}</Text>
        <Text style={styles.body}>{t('consent.decline_explanation')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.replace('Consent')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{t('consent.reconsider')}</Text>
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
    marginBottom: 36,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
