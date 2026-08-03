import { apiClient } from './apiClient';

export type MoodTag = 'stress' | 'anxiety' | 'sadness' | 'calm' | 'tired';
export type MoodTopic = 'work' | 'relationship' | 'health' | 'sleep' | 'other';
export type MeditationLanguage = 'de' | 'en';

export type SubmitCheckInRequest = {
  userId: string;
  rawUserText: string | null;
  consentGiven: true;
};

export type SubmitCheckInResponse = {
  id: string;
  moodTag: MoodTag;
  intensity: number;
  topic: MoodTopic | null;
  aiSummary: string;
  createdAt: string;
};

export type WeeklyPatternResponse = {
  patternSummary: string | null;
  entryCount: number;
};

export type GenerateMeditationRequest = {
  userId: string;
  language: MeditationLanguage;
  checkInId: string;
};

export type GenerateMeditationResponse = {
  id: string;
  script: string;
  language: MeditationLanguage;
  generatedAt: string;
};

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiContractError';
  }
}

export async function submitCheckIn(
  request: SubmitCheckInRequest,
): Promise<SubmitCheckInResponse> {
  const response = await apiClient.post<unknown>('/mood-entries', request);
  if (!isSubmitCheckInResponse(response.data)) {
    throw new ApiContractError('The mood-entry API returned a malformed response.');
  }
  return response.data;
}

export async function getWeeklyPattern(userId: string): Promise<WeeklyPatternResponse> {
  const response = await apiClient.get<unknown>('/mood-entries/weekly-pattern', {
    params: { userId },
  });
  if (!isWeeklyPatternResponse(response.data)) {
    throw new ApiContractError('The weekly-pattern API returned a malformed response.');
  }
  return response.data;
}

export async function generateMeditation(
  request: GenerateMeditationRequest,
): Promise<GenerateMeditationResponse> {
  const response = await apiClient.post<unknown>('/meditations/generate', request);
  if (!isGenerateMeditationResponse(response.data)) {
    throw new ApiContractError('The meditation API returned a malformed response.');
  }
  return response.data;
}

const moodTags: readonly MoodTag[] = ['stress', 'anxiety', 'sadness', 'calm', 'tired'];
const moodTopics: readonly MoodTopic[] = ['work', 'relationship', 'health', 'sleep', 'other'];
const languages: readonly MeditationLanguage[] = ['de', 'en'];

function isSubmitCheckInResponse(value: unknown): value is SubmitCheckInResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    moodTags.includes(value.moodTag as MoodTag) &&
    Number.isInteger(value.intensity) &&
    Number(value.intensity) >= 1 &&
    Number(value.intensity) <= 5 &&
    (value.topic === null || moodTopics.includes(value.topic as MoodTopic)) &&
    typeof value.aiSummary === 'string' &&
    isIsoDate(value.createdAt)
  );
}

function isWeeklyPatternResponse(value: unknown): value is WeeklyPatternResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.patternSummary === null || typeof value.patternSummary === 'string') &&
    Number.isInteger(value.entryCount) &&
    Number(value.entryCount) >= 0
  );
}

function isGenerateMeditationResponse(value: unknown): value is GenerateMeditationResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.script === 'string' &&
    value.script.trim().length > 0 &&
    languages.includes(value.language as MeditationLanguage) &&
    isIsoDate(value.generatedAt)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
