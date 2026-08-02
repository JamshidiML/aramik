import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';

// TODO(Codex): این اسکرین placeholder است - طبق docs/MASTER_SPEC.md پیاده‌سازی کامل شود.
export default function PaywallScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('paywall.title')}</Text>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
