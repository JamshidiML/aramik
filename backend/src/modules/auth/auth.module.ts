import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './user.entity';

const ACCESS_TOKEN_TTL = '30d';

// Global so JwtAuthGuard can be reused by MoodModule/MeditationModule without each of
// them importing AuthModule's internals.
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Dev-only fallback so a fresh checkout runs without extra setup; every real
        // deployment must set JWT_SECRET explicitly (see backend/.env.example).
        secret: config.get<string>('JWT_SECRET', 'dev-insecure-secret-change-me'),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
