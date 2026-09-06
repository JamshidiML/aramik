import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Repository } from 'typeorm';

import { AuthService } from '../src/modules/auth/auth.service';
import { User } from '../src/modules/auth/user.entity';

function createSubject(existingUser: User | null = null) {
  const users = new Map<string, User>();
  if (existingUser) {
    users.set(existingUser.email, existingUser);
  }

  const repository = {
    create: jest.fn((partial: Partial<User>) => partial as User),
    findOne: jest.fn(async ({ where }: { where: { email: string } }) =>
      users.get(where.email) ?? null,
    ),
    save: jest.fn(async (user: User) => {
      const saved = { ...user, id: user.id ?? 'generated-id', createdAt: new Date() };
      users.set(saved.email, saved);
      return saved;
    }),
  } as unknown as Repository<User>;

  const jwtService = { sign: jest.fn(() => 'signed.jwt.token') } as unknown as JwtService;

  return { repository, service: new AuthService(repository, jwtService) };
}

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user with a hashed password and issues a token', async () => {
    const { repository, service } = createSubject();

    const response = await service.register({
      email: 'User@Example.com',
      password: 'a-strong-password',
    });

    expect(response).toEqual({
      accessToken: 'signed.jwt.token',
      userId: 'generated-id',
      email: 'user@example.com',
    });
    const savedUser = (repository.save as jest.Mock).mock.calls[0][0] as User;
    expect(savedUser.passwordHash).not.toBe('a-strong-password');
  });

  it('rejects registration when the email is already taken', async () => {
    const { service } = createSubject({
      id: 'existing-id',
      email: 'user@example.com',
      passwordHash: 'irrelevant',
      createdAt: new Date(),
    });

    await expect(
      service.register({ email: 'user@example.com', password: 'a-strong-password' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with the correct password', async () => {
    const { service } = createSubject();
    await service.register({ email: 'user@example.com', password: 'a-strong-password' });

    await expect(
      service.login({ email: 'user@example.com', password: 'a-strong-password' }),
    ).resolves.toMatchObject({ email: 'user@example.com' });
  });

  it('rejects login with the wrong password without revealing which part was wrong', async () => {
    const { service } = createSubject();
    await service.register({ email: 'user@example.com', password: 'a-strong-password' });

    await expect(
      service.login({ email: 'user@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for an email that was never registered', async () => {
    const { service } = createSubject();

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
