import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

// Simple in-memory store for failed login attempts (per IP)
const failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, ip: string) {
    // Check lockout
    const record = failedAttempts.get(ip);
    if (record?.lockedUntil && record.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Demasiados intentos fallidos. Intente nuevamente en ${LOCKOUT_MINUTES} minutos.`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    const isValid =
      user && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!isValid || !user.isActive) {
      // Increment failed attempts
      const current = failedAttempts.get(ip) ?? { count: 0 };
      current.count += 1;
      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = new Date(
          Date.now() + LOCKOUT_MINUTES * 60 * 1000,
        );
      }
      failedAttempts.set(ip, current);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Reset failed attempts on success
    failedAttempts.delete(ip);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
