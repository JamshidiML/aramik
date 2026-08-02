import { create } from 'zustand';

export type MoodId = 'stress' | 'anxious' | 'sad' | 'calm' | 'tired';

export type CheckInDraft = {
  mood: MoodId;
  note: string;
};

type CheckInState = {
  latestCheckIn: CheckInDraft | null;
  saveCheckIn: (checkIn: CheckInDraft) => void;
};

// Day 1 mock: sensitive mood data stays in memory until the consent-aware backend is added.
export const useCheckInStore = create<CheckInState>((set) => ({
  latestCheckIn: null,
  saveCheckIn: (checkIn) => set({ latestCheckIn: checkIn }),
}));
