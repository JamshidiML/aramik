import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';

const PASSWORD_HASH_ROUNDS = 12;

export type AuthResponse = {
  accessToken: string;
  userId: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = normalizeEmail(dto.email);
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS);
    const user = await this.userRepository.save(
      this.userRepository.create({ email, passwordHash }),
    );

    return this.toAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = normalizeEmail(dto.email);
    const user = await this.userRepository.findOne({ where: { email } });
    const isPasswordValid = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    // Same error for "no such user" and "wrong password" so login cannot be used to
    // enumerate registered emails.
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.toAuthResponse(user);
  }

  private toAuthResponse(user: User): AuthResponse {
    return {
      accessToken: this.jwtService.sign({ sub: user.id }),
      userId: user.id,
      email: user.email,
    };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
