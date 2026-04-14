import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StudentProfile, TeacherProfile, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';
import { GoogleProfileInput } from '@/auth/types/google-profile.type';
import { AccessTokenPayload, RefreshTokenPayload } from './types/jwt-payload.type';

type UserWithProfiles = User & {
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          surname: dto.surname.trim(),
          email: dto.email.toLowerCase(),
          passwordHash,
        },
      });

      const studentProfile = await tx.studentProfile.create({
        data: { userId: user.id },
      });
      const teacherProfile = await tx.teacherProfile.create({
        data: { userId: user.id },
      });

      return { user, studentProfile, teacherProfile };
    });

    return this.issueSession(created.user, created.studentProfile.id, created.teacherProfile.id, userAgent, ipAddress);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.studentProfile || !user.teacherProfile) {
      throw new BadRequestException('User profiles are missing');
    }

    return this.issueSession(user, user.studentProfile.id, user.teacherProfile.id, userAgent, ipAddress);
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const session = await this.prisma.refreshSession.findUnique({
      where: { id: payload.sid },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh session is no longer valid');
    }

    const redisKey = this.buildRedisSessionKey(payload.sub, session.id);
    const redisSession = await this.redisService.getClient().get(redisKey);
    if (!redisSession) {
      throw new UnauthorizedException('Refresh session has expired');
    }

    const isValidToken = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user || !user.studentProfile || !user.teacherProfile) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    await this.redisService.getClient().del(redisKey);

    return this.issueSession(user, user.studentProfile.id, user.teacherProfile.id, userAgent, ipAddress);
  }

  async logout(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: refreshSecret,
      });

      await this.prisma.refreshSession.updateMany({
        where: { id: payload.sid, userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.redisService
        .getClient()
        .del(this.buildRedisSessionKey(payload.sub, payload.sid));

      return { success: true };
    } catch {
      return { success: true };
    }
  }

  async me(userId: string, authorizationHeader?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user || !user.studentProfile || !user.teacherProfile) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
      profiles: {
        studentProfileId: user.studentProfile.id,
        teacherProfileId: user.teacherProfile.id,
      },
      accessToken: authorizationHeader?.replace('Bearer ', '') ?? null,
    };
  }

  async loginWithGoogle(
    profile: GoogleProfileInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    const email = profile.email.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Google account email is required');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email },
        include: {
          studentProfile: true,
          teacherProfile: true,
        },
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash(`google:${randomUUID()}`, 10);
        const createdUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name: profile.name.trim() || 'Google',
            surname: profile.surname.trim() || 'User',
          },
        });

        const studentProfile = await tx.studentProfile.create({
          data: { userId: createdUser.id },
        });
        const teacherProfile = await tx.teacherProfile.create({
          data: { userId: createdUser.id },
        });

        return {
          ...createdUser,
          studentProfile,
          teacherProfile,
        };
      }

      const studentProfile =
        existing.studentProfile ??
        (await tx.studentProfile.create({
          data: { userId: existing.id },
        }));
      const teacherProfile =
        existing.teacherProfile ??
        (await tx.teacherProfile.create({
          data: { userId: existing.id },
        }));

      return {
        ...existing,
        studentProfile,
        teacherProfile,
      };
    });

    return this.issueSession(
      user,
      user.studentProfile.id,
      user.teacherProfile.id,
      userAgent,
      ipAddress,
    );
  }

  getFrontendOriginForRedirect(): string {
    return this.configService.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:3000';
  }

  private async issueSession(
    user: User | UserWithProfiles,
    studentProfileId: string,
    teacherProfileId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';
    const accessExpiresSeconds = this.parseDurationToSeconds(accessExpiresIn, 15 * 60);
    const refreshExpiresSeconds = this.parseDurationToSeconds(refreshExpiresIn, 7 * 24 * 60 * 60);

    const refreshExpiryDate = new Date(Date.now() + refreshExpiresSeconds * 1000);
    const session = await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        expiresAt: refreshExpiryDate,
        userAgent: userAgent?.slice(0, 1024),
        ipAddress: ipAddress?.slice(0, 128),
      },
    });

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sid: session.id,
      type: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: accessSecret,
      expiresIn: accessExpiresSeconds,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresSeconds,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    const redisKey = this.buildRedisSessionKey(user.id, session.id);
    const ttlSeconds = Math.max(1, Math.floor((refreshExpiryDate.getTime() - Date.now()) / 1000));
    await this.redisService.getClient().set(redisKey, '1', {
      EX: ttlSeconds,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
      profiles: {
        studentProfileId,
        teacherProfileId,
      },
    };
  }

  private buildRedisSessionKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  private parseDurationToSeconds(duration: string, fallbackSeconds: number): number {
    const match = duration.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return fallbackSeconds;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier =
      unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 60 * 60 : 24 * 60 * 60;

    return amount * multiplier;
  }
}
