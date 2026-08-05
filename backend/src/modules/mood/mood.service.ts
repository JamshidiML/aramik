import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { ClaudeService } from '../../common/claude.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { MoodEntry, MoodTag, MoodTopic } from './mood.entity';

const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

type ExtractedMood = {
  moodTag: MoodTag;
  intensity: number;
  topic: MoodTopic | null;
  summary: string;
};

export type MoodEntryResponse = {
  id: string;
  moodTag: MoodTag;
  intensity: number;
  topic: MoodTopic | null;
  aiSummary: string;
  createdAt: Date;
};

export type WeeklyPatternResponse = {
  patternSummary: string | null;
  entryCount: number;
};

@Injectable()
export class MoodEntriesService {
  private readonly logger = new Logger(MoodEntriesService.name);

  constructor(
    @InjectRepository(MoodEntry)
    private readonly moodEntryRepository: Repository<MoodEntry>,
    private readonly claudeService: ClaudeService,
  ) {}

  async createMoodEntry(dto: CreateMoodEntryDto): Promise<MoodEntryResponse> {
    if (dto.consentGiven !== true) {
      throw new ForbiddenException('Explicit consent is required to process health data.');
    }

    const extractedMood = await this.extractMood(dto.rawUserText ?? '');
    const moodEntry = this.moodEntryRepository.create({
      userId: dto.userId,
      rawUserText: dto.rawUserText,
      moodTag: extractedMood.moodTag,
      intensity: extractedMood.intensity,
      topic: extractedMood.topic,
      aiSummary: extractedMood.summary,
    });
    const savedEntry = await this.moodEntryRepository.save(moodEntry);

    return this.toResponse(savedEntry);
  }

  async getWeeklyPattern(userId: string): Promise<WeeklyPatternResponse> {
    const entries = await this.moodEntryRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(new Date(Date.now() - SEVEN_DAYS_IN_MILLISECONDS)),
      },
      order: { createdAt: 'ASC' },
    });

    if (entries.length < 3) {
      return { patternSummary: null, entryCount: entries.length };
    }

    let patternSummary: string;
    try {
      patternSummary = await this.claudeService.summarizeWeeklyPattern(
        entries.map((entry) => entry.aiSummary ?? ''),
      );
    } catch {
      throw new BadGatewayException('The mood-pattern service is temporarily unavailable.');
    }

    const normalizedSummary = patternSummary.trim();
    if (normalizedSummary.length === 0) {
      throw new BadGatewayException('The mood-pattern service returned an empty response.');
    }

    return { patternSummary: normalizedSummary, entryCount: entries.length };
  }

  async getEntryForUser(checkInId: string, userId: string): Promise<MoodEntry> {
    const entry = await this.moodEntryRepository.findOne({
      where: { id: checkInId, userId },
    });

    if (!entry) {
      throw new NotFoundException('The requested check-in was not found.');
    }

    return entry;
  }

  private async extractMood(rawUserText: string): Promise<ExtractedMood> {
    let extractedMood: unknown;
    try {
      extractedMood = await this.claudeService.extractMoodStructured(rawUserText);
    } catch (error) {
      this.logger.error(`Mood extraction provider call failed: ${getErrorName(error)}`);
      throw new BadGatewayException('The mood-extraction service is temporarily unavailable.');
    }

    if (!isExtractedMood(extractedMood)) {
      this.logger.error('Mood extraction provider returned an invalid structured response.');
      throw new BadGatewayException('The mood-extraction service returned malformed data.');
    }

    return { ...extractedMood, summary: extractedMood.summary.trim() };
  }

  private toResponse(entry: MoodEntry): MoodEntryResponse {
    return {
      id: entry.id,
      moodTag: entry.moodTag,
      intensity: entry.intensity,
      topic: entry.topic,
      aiSummary: entry.aiSummary ?? '',
      createdAt: entry.createdAt,
    };
  }
}

function isExtractedMood(value: unknown): value is ExtractedMood {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    Object.values(MoodTag).includes(candidate.moodTag as MoodTag) &&
    Number.isInteger(candidate.intensity) &&
    Number(candidate.intensity) >= 1 &&
    Number(candidate.intensity) <= 5 &&
    (candidate.topic === null || Object.values(MoodTopic).includes(candidate.topic as MoodTopic)) &&
    typeof candidate.summary === 'string' &&
    candidate.summary.trim().length > 0 &&
    candidate.summary.trim().split(/\s+/u).length <= 50
  );
}

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}
