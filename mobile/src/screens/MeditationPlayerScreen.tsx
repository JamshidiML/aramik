import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';

// TODO(Codex): This screen is a placeholder; implement it fully according to docs/MASTER_SPEC.md.
export default function MeditationPlayerScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('meditation.generating')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
  },
});
