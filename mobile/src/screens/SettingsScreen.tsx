import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';

const languageSwitchTrackColors = {
  false: colors.border,
  true: colors.primary,
};

export default function SettingsScreen() {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const showCancelSubscriptionPlaceholder = () => {
    Alert.alert(
      t('settings.cancel_subscription'),
      t('settings.cancel_subscription_placeholder'),
      [{ text: t('common.ok') }],
    );
  };

  const showDeleteDataPlaceholder = () => {
    Alert.alert(t('settings.delete_data'), t('settings.delete_data_placeholder'), [
      { text: t('common.ok') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.languageControl}>
            <Text style={[styles.languageLabel, !isEnglish && styles.languageLabelActive]}>
              {t('settings.language_german')}
            </Text>
            <Switch
              accessibilityLabel={t('settings.language_switch_label')}
              ios_backgroundColor={colors.border}
              onValueChange={(value) => {
                void i18n.changeLanguage(value ? 'en' : 'de');
              }}
              thumbColor={colors.white}
              trackColor={languageSwitchTrackColors}
              value={isEnglish}
            />
            <Text style={[styles.languageLabel, isEnglish && styles.languageLabelActive]}>
              {t('settings.language_english')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={showCancelSubscriptionPlaceholder}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.actionButtonText}>{t('settings.cancel_subscription')}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            accessibilityRole="button"
            onPress={showDeleteDataPlaceholder}
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.dangerButtonPressed,
            ]}
          >
            <Text style={styles.dangerButtonText}>{t('settings.delete_data')}</Text>
          </Pressable>
        </View>
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
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 30,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  languageControl: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageLabel: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: '500',
  },
  languageLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  dangerButtonPressed: {
    opacity: 0.78,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});
