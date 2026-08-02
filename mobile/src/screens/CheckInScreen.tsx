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
import { type MoodId, useCheckInStore } from '../store/checkInStore';
import { colors } from '../theme/colors';

type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

const moodOptions: readonly { id: MoodId; translationKey: string }[] = [
  { id: 'stress', translationKey: 'checkin.mood_stress' },
  { id: 'anxious', translationKey: 'checkin.mood_anxious' },
  { id: 'sad', translationKey: 'checkin.mood_sad' },
  { id: 'calm', translationKey: 'checkin.mood_calm' },
  { id: 'tired', translationKey: 'checkin.mood_tired' },
];

export default function CheckInScreen({ navigation }: CheckInScreenProps) {
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const saveCheckIn = useCheckInStore((state) => state.saveCheckIn);

  const handleSubmit = () => {
    if (selectedMood === null) {
      return;
    }

    saveCheckIn({ mood: selectedMood, note: note.trim() });
    navigation.navigate('MeditationPlayer', { meditationId: 'mock-day1-meditation' });
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
            accessibilityState={{ disabled: selectedMood === null }}
            disabled={selectedMood === null}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              selectedMood === null && styles.submitButtonDisabled,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>{t('checkin.submit')}</Text>
          </Pressable>
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
});
