import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { AuthService } from "@/modules/auth/auth.service";
import { ForgotPasswordDto } from "@/modules/auth/dto/forgot-password.dto";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "@/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { ResetPasswordDto } from "@/modules/auth/dto/reset-password.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("verify-email/:token")
  verifyEmail(@Param("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get("oauth/:provider")
  oauthBootstrap(@Param("provider") provider: "google" | "apple") {
    return this.authService.getOAuthBootstrap(provider);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@CurrentUser() user: RequestUser) {
    return this.authService.logout(user);
  }
}
