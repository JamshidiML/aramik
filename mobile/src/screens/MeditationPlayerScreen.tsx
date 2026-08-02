import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type MeditationPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MeditationPlayer'
>;

export default function MeditationPlayerScreen({ route }: MeditationPlayerScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('meditation.generated_title')}</Text>
        <Text style={styles.script}>{route.params.script}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 24,
  },
  script: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 28,
  },
});
