import { IsBoolean, IsDefined, IsString, ValidateIf } from 'class-validator';

export class CreateMoodEntryDto {
  @IsDefined()
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsString()
  rawUserText!: string | null;

  @IsDefined()
  @IsBoolean()
  consentGiven!: boolean;
}
