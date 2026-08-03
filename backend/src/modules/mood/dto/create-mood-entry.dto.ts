import { IsBoolean, IsDefined, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateMoodEntryDto {
  @IsUUID()
  userId!: string;

  @IsDefined()
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsString()
  rawUserText!: string | null;

  @IsDefined()
  @IsBoolean()
  consentGiven!: boolean;
}
