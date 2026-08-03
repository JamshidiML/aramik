import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoodEntriesController } from './mood.controller';
import { MoodEntry } from './mood.entity';
import { MoodEntriesService } from './mood.service';

@Module({
  imports: [TypeOrmModule.forFeature([MoodEntry])],
  controllers: [MoodEntriesController],
  providers: [MoodEntriesService],
  exports: [MoodEntriesService],
})
export class MoodModule {}
