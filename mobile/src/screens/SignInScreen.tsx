import React, { useState } from 'react';
import {
  Alert,
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
import { useAuthStore } from '../store/authStore';
import { useConsentStore } from '../store/consentStore';
import { colors } from '../theme/colors';

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

// Apple/Google Sign-In need OAuth credentials tied to this app's own Apple Developer
// and Google Cloud projects (see docs/AUTH_SETUP.md); until those are configured, these
// buttons tell the user rather than pretending to sign them in.
function showOAuthUnavailable(t: (key: string) => string) {
  Alert.alert(t('auth.oauth_unavailable_title'), t('auth.oauth_unavailable_body'), [
    { text: t('common.ok') },
  ]);
}

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const consentGiven = useConsentStore((state) => state.consentGiven);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setHasError(false);
    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      navigation.replace(consentGiven === true ? 'CheckIn' : 'Onboarding');
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('auth.sign_in_title')}</Text>

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
            autoComplete="password"
            onChangeText={setPassword}
            placeholder={t('auth.password_placeholder')}
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.textInput}
            value={password}
          />

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
              {t(isSubmitting ? 'auth.signing_in' : 'auth.sign_in_submit')}
            </Text>
          </Pressable>

          {hasError && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {t('auth.error_generic')}
            </Text>
          )}

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            onPress={() => showOAuthUnavailable(t)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          >
            <Text style={styles.secondaryButtonText}>{t('auth.continue_with_apple')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => showOAuthUnavailable(t)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          >
            <Text style={styles.secondaryButtonText}>{t('auth.continue_with_google')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.switchLink}
          >
            <Text style={styles.switchLinkText}>{t('auth.switch_to_sign_up')}</Text>
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
    marginBottom: 20,
    minHeight: 54,
    paddingHorizontal: 16,
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
  divider: {
    marginTop: 28,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 14,
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  secondaryButtonPressed: {
    opacity: 0.78,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  switchLinkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
