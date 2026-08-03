import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClaudeService } from '../../common/claude.service';
import { MoodEntriesService } from '../mood/mood.service';
import { GenerateMeditationDto } from './dto/generate-meditation.dto';
import { Meditation } from './meditation.entity';

export type MeditationResponse = {
  id: string;
  script: string;
  language: 'de' | 'en';
  generatedAt: Date;
};

@Injectable()
export class MeditationService {
  constructor(
    @InjectRepository(Meditation)
    private readonly meditationRepository: Repository<Meditation>,
    private readonly moodEntriesService: MoodEntriesService,
    private readonly claudeService: ClaudeService,
  ) {}

  async generate(dto: GenerateMeditationDto): Promise<MeditationResponse> {
    const checkIn = await this.moodEntriesService.getEntryForUser(dto.checkInId, dto.userId);
    const weeklyPattern = await this.moodEntriesService.getWeeklyPattern(dto.userId);
    const todayCheckIn =
      checkIn.rawUserText?.trim() || checkIn.aiSummary?.trim() || checkIn.moodTag;

    let script: string;
    try {
      script = await this.claudeService.generatePersonalizedMeditation({
        language: dto.language,
        todayCheckIn,
        weeklyPattern: weeklyPattern.patternSummary,
      });
    } catch {
      throw new BadGatewayException('The meditation-generation service is temporarily unavailable.');
    }

    const normalizedScript = script.trim();
    if (normalizedScript.length === 0) {
      throw new BadGatewayException('The meditation-generation service returned an empty response.');
    }

    const meditation = this.meditationRepository.create({
      userId: dto.userId,
      script: normalizedScript,
      language: dto.language,
    });
    const savedMeditation = await this.meditationRepository.save(meditation);

    return {
      id: savedMeditation.id,
      script: savedMeditation.script,
      language: savedMeditation.language,
      generatedAt: savedMeditation.generatedAt,
    };
  }
}
