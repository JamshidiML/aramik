import { describe, expect, it } from '@jest/globals';

import { MOOD_IDS } from '../checkInStore';

const backendMoodTagValues = ['stress', 'anxiety', 'sadness', 'calm', 'tired'] as const;

describe('MoodId', () => {
  it('matches the backend MoodTag string values', () => {
    expect(MOOD_IDS).toEqual(backendMoodTagValues);
  });
});
