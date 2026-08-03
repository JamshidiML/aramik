import { IsIn, IsUUID } from 'class-validator';

export class GenerateMeditationDto {
  @IsUUID()
  userId!: string;

  @IsIn(['de', 'en'])
  language!: 'de' | 'en';

  @IsUUID()
  checkInId!: string;
}
