import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { MoodEntriesService } from './mood.service';

@Controller('mood-entries')
@UseGuards(JwtAuthGuard)
export class MoodEntriesController {
  constructor(private readonly moodEntriesService: MoodEntriesService) {}

  @Post()
  create(@Body() dto: CreateMoodEntryDto, @CurrentUser() userId: string) {
    return this.moodEntriesService.createMoodEntry(dto, userId);
  }

  @Get('weekly-pattern')
  getWeeklyPattern(@CurrentUser() userId: string) {
    return this.moodEntriesService.getWeeklyPattern(userId);
  }
}
