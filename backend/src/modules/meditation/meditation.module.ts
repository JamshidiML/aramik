import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoodModule } from '../mood/mood.module';
import { MeditationController } from './meditation.controller';
import { Meditation } from './meditation.entity';
import { MeditationService } from './meditation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meditation]), MoodModule],
  controllers: [MeditationController],
  providers: [MeditationService],
})
export class MeditationModule {}
