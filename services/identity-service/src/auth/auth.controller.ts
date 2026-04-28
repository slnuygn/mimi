import {
  Body,
  Controller,
  Get,
  Patch,
  Headers,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleCallbackGuard } from './guards/google-callback.guard';
import { AuthService } from '@/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleProfileInput } from './types/google-profile.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.register(dto, userAgent, ipAddress);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Post('refresh')
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.refresh(dto.refreshToken, userAgent, ipAddress);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleSignIn() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(
    @Req() request: Request & { user: GoogleProfileInput },
    @Res() response: Response,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
    @Query('state') state?: string,
  ) {
    try {
      const authResponse = await this.authService.loginWithGoogle(
        request.user,
        userAgent,
        ipAddress,
      );

      const redirectPath = state === 'register' ? '/register' : '/login';
      const callbackUrl = new URL(
        redirectPath,
        this.authService.getFrontendOriginForRedirect(),
      );

      callbackUrl.searchParams.set('accessToken', authResponse.accessToken);
      callbackUrl.searchParams.set('refreshToken', authResponse.refreshToken);

      return response.redirect(callbackUrl.toString());
    } catch {
      const fallbackPath = state === 'register' ? '/register' : '/login';
      const fallbackUrl = new URL(
        fallbackPath,
        this.authService.getFrontendOriginForRedirect(),
      );
      fallbackUrl.searchParams.set('error', 'google-auth-failed');

      return response.redirect(fallbackUrl.toString());
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { sub: string; email: string }, @Req() request: Request) {
    if (!user?.sub) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.me(user.sub, request.headers.authorization);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfile(
    @CurrentUser() user: { sub: string; email: string },
    @Body()
    body: {
      username?: string;
      name?: string;
      surname?: string;
      profilePhotoData?: string;
      profilePhotoName?: string;
    },
    @UploadedFile()
    file?: {
      buffer?: Buffer;
      originalname?: string;
    },
  ) {
    if (!user?.sub) {
      throw new UnauthorizedException('Unauthorized');
    }

    let profilePhotoUrl: string | undefined = undefined;
    if (file?.buffer) {
      const uploadsDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeOriginal = (file.originalname ?? body.profilePhotoName ?? 'profile').replace(/\s+/g, '_');
      const filename = `${Date.now()}-${safeOriginal}`;
      fs.writeFileSync(join(uploadsDir, filename), file.buffer);
      profilePhotoUrl = `/uploads/${filename}`;
    }

    const updated = await this.authService.updateProfile(user.sub, {
      name: body.name,
      surname: body.surname,
      username: body.username,
      profilePhotoUrl,
    });

    return { user: updated };
  }
}
