import { IsUUID } from 'class-validator';

export class WeeklyPatternQueryDto {
  @IsUUID()
  userId!: string;
}
