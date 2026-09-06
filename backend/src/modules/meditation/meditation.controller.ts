import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateMeditationDto } from './dto/generate-meditation.dto';
import { MeditationService } from './meditation.service';

@Controller('meditations')
@UseGuards(JwtAuthGuard)
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  @Post('generate')
  generate(@Body() dto: GenerateMeditationDto, @CurrentUser() userId: string) {
    return this.meditationService.generate(dto, userId);
  }
}
