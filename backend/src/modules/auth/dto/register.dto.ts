import { IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  // Intentionally low floor for the MVP; raise together with a real password-strength
  // policy before launch.
  @MinLength(8)
  password!: string;
}
