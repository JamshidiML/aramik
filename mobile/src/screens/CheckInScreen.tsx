import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { generateMeditation, submitCheckIn } from '../services/moodService';
import { type MoodId, useCheckInStore } from '../store/checkInStore';
import { useConsentStore } from '../store/consentStore';
import { colors } from '../theme/colors';

type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

const moodOptions: readonly { id: MoodId; translationKey: string }[] = [
  { id: 'stress', translationKey: 'checkin.mood_stress' },
  { id: 'anxiety', translationKey: 'checkin.mood_anxious' },
  { id: 'sadness', translationKey: 'checkin.mood_sad' },
  { id: 'calm', translationKey: 'checkin.mood_calm' },
  { id: 'tired', translationKey: 'checkin.mood_tired' },
];

export default function CheckInScreen({ navigation }: CheckInScreenProps) {
  const { i18n, t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveCheckIn = useCheckInStore((state) => state.saveCheckIn);
  const consentGiven = useConsentStore((state) => state.consentGiven);

  const handleSubmit = async () => {
    if (selectedMood === null || isSubmitting) {
      return;
    }

    if (consentGiven !== true) {
      navigation.replace('Consent');
      return;
    }

    // TODO(auth): replace with real authenticated user id once auth is implemented
    const userId = 'f4f6c776-eec9-4b67-85bd-f95f538a96e8';
    const normalizedNote = note.trim();
    const language = i18n.language.startsWith('en') ? 'en' : 'de';

    setHasSubmitError(false);
    setIsSubmitting(true);
    saveCheckIn({ mood: selectedMood, note: normalizedNote });

    try {
      const checkIn = await submitCheckIn({
        userId,
        rawUserText: normalizedNote || selectedMood,
        consentGiven,
      });
      const meditation = await generateMeditation({
        userId,
        language,
        checkInId: checkIn.id,
      });
      navigation.navigate('MeditationPlayer', {
        meditationId: meditation.id,
        script: meditation.script,
      });
    } catch {
      setHasSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('checkin.title')}</Text>

          <View style={styles.moodGrid}>
            {moodOptions.map((mood) => {
              const isSelected = mood.id === selectedMood;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={mood.id}
                  onPress={() => setSelectedMood(mood.id)}
                  style={({ pressed }) => [
                    styles.moodButton,
                    isSelected && styles.moodButtonSelected,
                    pressed && styles.moodButtonPressed,
                  ]}
                >
                  <Text style={[styles.moodText, isSelected && styles.moodTextSelected]}>
                    {t(mood.translationKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>{t('checkin.prompt_label')}</Text>
          <TextInput
            accessibilityLabel={t('checkin.prompt_label')}
            maxLength={500}
            multiline
            onChangeText={setNote}
            placeholder={t('checkin.prompt_placeholder')}
            placeholderTextColor={colors.mutedText}
            style={styles.textInput}
            textAlignVertical="top"
            value={note}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedMood === null || isSubmitting }}
            disabled={selectedMood === null || isSubmitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              (selectedMood === null || isSubmitting) && styles.submitButtonDisabled,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {t(isSubmitting ? 'meditation.generating' : 'checkin.submit')}
            </Text>
          </Pressable>

          {hasSubmitError && (
            <View style={styles.errorContainer}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {t('checkin.submit_error')}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleSubmit()}
                style={({ pressed }) => [styles.retryButton, pressed && styles.submitButtonPressed]}
              >
                <Text style={styles.retryButtonText}>{t('checkin.retry')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 28,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  moodButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: '46%',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  moodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodButtonPressed: {
    opacity: 0.82,
  },
  moodText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodTextSelected: {
    color: colors.white,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    minHeight: 132,
    padding: 16,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  errorContainer: {
    marginTop: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 14,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
