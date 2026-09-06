import { IsIn, IsUUID } from 'class-validator';

export class GenerateMeditationDto {
  @IsIn(['de', 'en'])
  language!: 'de' | 'en';

  @IsUUID()
  checkInId!: string;
}
