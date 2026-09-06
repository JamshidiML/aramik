import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { useConsentStore } from '../store/consentStore';
import { colors } from '../theme/colors';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const consentGiven = useConsentStore((state) => state.consentGiven);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setHasError(false);
    setIsSubmitting(true);
    try {
      await signUp({ email: email.trim(), password });
      navigation.replace(consentGiven === true ? 'CheckIn' : 'Onboarding');
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    email.trim().length > 0 && password.length >= MIN_PASSWORD_LENGTH && !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('auth.sign_up_title')}</Text>

          <Text style={styles.inputLabel}>{t('auth.email_label')}</Text>
          <TextInput
            accessibilityLabel={t('auth.email_label')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={t('auth.email_placeholder')}
            placeholderTextColor={colors.mutedText}
            style={styles.textInput}
            value={email}
          />

          <Text style={styles.inputLabel}>{t('auth.password_label')}</Text>
          <TextInput
            accessibilityLabel={t('auth.password_label')}
            autoComplete="password-new"
            onChangeText={setPassword}
            placeholder={t('auth.password_placeholder')}
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.textInput}
            value={password}
          />
          <Text style={styles.hint}>{t('auth.password_hint')}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {t(isSubmitting ? 'auth.signing_up' : 'auth.sign_up_submit')}
            </Text>
          </Pressable>

          {hasError && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {t('auth.error_generic')}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.switchLink}
          >
            <Text style={styles.switchLinkText}>{t('auth.switch_to_sign_in')}</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 28,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  hint: {
    color: colors.mutedText,
    fontSize: 13,
    marginBottom: 20,
    marginTop: 8,
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
  errorText: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    textAlign: 'center',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
  },
  switchLinkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
