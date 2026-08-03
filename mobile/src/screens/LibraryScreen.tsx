import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';

// TODO(Codex): This screen is a placeholder; implement it fully according to docs/MASTER_SPEC.md.
export default function LibraryScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('meditation.library_title')}</Text>
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
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
