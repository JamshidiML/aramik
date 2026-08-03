import { Body, Controller, Post } from '@nestjs/common';

import { GenerateMeditationDto } from './dto/generate-meditation.dto';
import { MeditationService } from './meditation.service';

@Controller('meditations')
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  @Post('generate')
  generate(@Body() dto: GenerateMeditationDto) {
    return this.meditationService.generate(dto);
  }
}
