import { create } from 'zustand';

export const MOOD_IDS = ['stress', 'anxiety', 'sadness', 'calm', 'tired'] as const;

// Keep these values in sync with MoodTag in backend/src/modules/mood/mood.entity.ts.
export type MoodId = (typeof MOOD_IDS)[number];

export type CheckInDraft = {
  mood: MoodId;
  note: string;
};

type CheckInState = {
  latestCheckIn: CheckInDraft | null;
  reset: () => void;
  saveCheckIn: (checkIn: CheckInDraft) => void;
};

// Day 1 mock: sensitive mood data stays in memory until the consent-aware backend is added.
export const useCheckInStore = create<CheckInState>((set) => ({
  latestCheckIn: null,
  reset: () => set({ latestCheckIn: null }),
  saveCheckIn: (checkIn) => set({ latestCheckIn: checkIn }),
}));
