import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { apiClient } from '../apiClient';
import {
  ApiContractError,
  generateMeditation,
  submitCheckIn,
} from '../moodService';

const postRequest = jest.spyOn(apiClient, 'post');

const checkInRequest = {
  userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
  rawUserText: 'Work felt overwhelming today.',
  consentGiven: true,
} as const;

describe('moodService', () => {
  beforeEach(() => {
    postRequest.mockReset();
  });

  it('returns contract-valid check-in and meditation responses', async () => {
    const checkInResponse = {
      id: '4f247cae-e092-48c9-8932-1d559b96d2bd',
      moodTag: 'stress',
      intensity: 4,
      topic: 'work',
      aiSummary: 'Work pressure caused stress.',
      createdAt: '2026-08-03T10:00:00.000Z',
    } as const;
    const meditationResponse = {
      id: 'e6de626c-647e-4871-9b4f-c50594c21f41',
      script: 'Take a slow breath.',
      language: 'en',
      generatedAt: '2026-08-03T10:00:01.000Z',
    } as const;
    postRequest
      .mockResolvedValueOnce({ data: checkInResponse })
      .mockResolvedValueOnce({ data: meditationResponse });

    await expect(submitCheckIn(checkInRequest)).resolves.toEqual(checkInResponse);
    await expect(
      generateMeditation({
        userId: checkInRequest.userId,
        language: 'en',
        checkInId: checkInResponse.id,
      }),
    ).resolves.toEqual(meditationResponse);
  });

  it('propagates network failures without returning partial data', async () => {
    postRequest.mockRejectedValueOnce(new Error('Network unavailable'));

    await expect(submitCheckIn(checkInRequest)).rejects.toThrow('Network unavailable');
  });

  it('rejects malformed API responses', async () => {
    postRequest.mockResolvedValueOnce({ data: { id: 'missing-required-fields' } });

    await expect(submitCheckIn(checkInRequest)).rejects.toBeInstanceOf(ApiContractError);
  });
});
