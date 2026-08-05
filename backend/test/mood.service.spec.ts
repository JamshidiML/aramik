import { BadGatewayException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import type { Repository } from 'typeorm';

import type { ClaudeService } from '../src/common/claude.service';
import { MoodEntry } from '../src/modules/mood/mood.entity';
import { MoodEntriesService } from '../src/modules/mood/mood.service';

function createSubject(entries: MoodEntry[] = []) {
  const repository = {
    create: jest.fn(),
    find: jest.fn<() => Promise<MoodEntry[]>>().mockResolvedValue(entries),
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as Repository<MoodEntry>;
  const claudeService = {
    extractMoodStructured: jest.fn(),
    summarizeWeeklyPattern: jest.fn(),
  } as unknown as ClaudeService;

  return {
    claudeService,
    service: new MoodEntriesService(repository, claudeService),
  };
}

describe('MoodEntriesService', () => {
  it('rejects mood processing when explicit consent was not given', async () => {
    const { claudeService, service } = createSubject();

    await expect(
      service.createMoodEntry({
        userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
        rawUserText: 'Work felt overwhelming today.',
        consentGiven: false,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(claudeService.extractMoodStructured).not.toHaveBeenCalled();
  });

  it('does not call Claude when fewer than three weekly entries exist', async () => {
    const entries = [
      { aiSummary: 'First summary' } as MoodEntry,
      { aiSummary: 'Second summary' } as MoodEntry,
    ];
    const { claudeService, service } = createSubject(entries);

    await expect(
      service.getWeeklyPattern('f4f6c776-eec9-4b67-85bd-f95f538a96e8'),
    ).resolves.toEqual({ patternSummary: null, entryCount: 2 });
    expect(claudeService.summarizeWeeklyPattern).not.toHaveBeenCalled();
  });

  it('rejects a malformed structured mood response before persistence', async () => {
    const { claudeService, service } = createSubject();
    jest.mocked(claudeService.extractMoodStructured).mockResolvedValue({
      moodTag: 'calm',
      intensity: 4,
      topic: 'other',
      summary: '',
    });

    await expect(
      service.createMoodEntry({
        userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
        rawUserText: 'I feel calm today.',
        consentGiven: true,
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
