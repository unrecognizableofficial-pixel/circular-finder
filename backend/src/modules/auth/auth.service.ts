import bcrypt from "bcrypt";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AccountStatus, RoleKey, SessionStatus } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { parseRoleKey } from "@/common/utils/role-key.util";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "@/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { ForgotPasswordDto } from "@/modules/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "@/modules/auth/dto/reset-password.dto";

type JwtTtl = `${number}${"s" | "m" | "h" | "d"}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException("An account already exists for this email.");
    }

    const roleKey = (dto.roleKey ? parseRoleKey(dto.roleKey) : null) ?? RoleKey.STANDARD_USER;
    const role = await this.prisma.role.findUnique({
      where: { key: roleKey },
      include: { permissions: { include: { permission: true } } }
    });

    if (!role) {
      throw new BadRequestException("The requested role is not available.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        passwordHash,
        roleId: role.id,
        profile: {
          create: {
            handle: dto.email.split("@")[0].replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase(),
            displayName: dto.fullName,
            bio: "Circular Finder member",
            impactPoints: 100
          }
        }
      }
    });

    const session = await this.createSession(user.id, "register");
    const permissions = role.permissions.map((entry) => entry.permission.key);
    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      role: role.key,
      permissions,
      sessionId: session.id
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: role.key
      },
      ...tokens
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.REMOVED) {
      throw new UnauthorizedException("This account cannot access Circular Finder right now.");
    }

    const session = await this.createSession(user.id, "login");
    const permissions = user.role.permissions.map((entry) => entry.permission.key);
    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      role: user.role.key,
      permissions,
      sessionId: session.id
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date()
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.key
      },
      ...tokens
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; sid: string; role: RoleKey; email: string; permissions: string[] }>(
      dto.refreshToken,
      { secret: this.configService.getOrThrow<string>("auth.refreshSecret") }
    );

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null
      }
    });

    if (!session) {
      throw new UnauthorizedException("Session revoked.");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() }
    });

    return this.signTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: session.id
    });
  }

  async logout(user: RequestUser) {
    if (!user.sessionId) {
      return { success: true };
    }

    await this.prisma.session.updateMany({
      where: {
        id: user.sessionId,
        userId: user.sub
      },
      data: {
        revokedAt: new Date(),
        status: SessionStatus.REVOKED
      }
    });

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    return {
      accepted: true,
      email: dto.email.toLowerCase(),
      message: "Password reset queued. Wire this to your email provider in production."
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) {
      throw new BadRequestException("No account found for this email.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 10)
      }
    });

    return {
      success: true,
      message: "Password updated."
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException("Verification token missing.");
    }

    return {
      success: true,
      message: "Email verification flow is ready for token validation integration."
    };
  }

  getOAuthBootstrap(provider: "google" | "apple") {
    return {
      provider,
      url: `https://auth.circularfinder.demo/${provider}`,
      message: `${provider} OAuth scaffold is ready for client credentials.`
    };
  }

  private async createSession(userId: string, context: string) {
    return this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: await bcrypt.hash(`${context}-${userId}-${Date.now()}`, 8),
        userAgent: `${context}-session`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });
  }

  private async signTokens(payload: { sub: string; email: string; role: RoleKey; permissions: string[]; sessionId: string }) {
    const accessTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: payload.sessionId
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.getOrThrow<string>("auth.accessSecret"),
        expiresIn: this.configService.getOrThrow<string>("auth.accessTtl") as JwtTtl
      }),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
          sid: payload.sessionId
        },
        {
          secret: this.configService.getOrThrow<string>("auth.refreshSecret"),
          expiresIn: this.configService.getOrThrow<string>("auth.refreshTtl") as JwtTtl
        }
      )
    ]);

    return { accessToken, refreshToken };
  }
}
