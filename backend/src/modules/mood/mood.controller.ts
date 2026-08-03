import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { WeeklyPatternQueryDto } from './dto/weekly-pattern-query.dto';
import { MoodEntriesService } from './mood.service';

@Controller('mood-entries')
export class MoodEntriesController {
  constructor(private readonly moodEntriesService: MoodEntriesService) {}

  @Post()
  create(@Body() dto: CreateMoodEntryDto) {
    return this.moodEntriesService.createMoodEntry(dto);
  }

  @Get('weekly-pattern')
  getWeeklyPattern(@Query() query: WeeklyPatternQueryDto) {
    return this.moodEntriesService.getWeeklyPattern(query.userId);
  }
}
