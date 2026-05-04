import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,  // JS không đọc được, chống XSS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
  }

  @ApiOperation({ summary: 'Lấy accessToken mới bằng refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Trả về accessToken mới' })
  @ApiResponse({ status: 401, description: 'Refresh token hết hạn hoặc không hợp lệ' })
  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request) {
    // Đọc refresh_token từ httpOnly cookie
    const refreshToken = req.cookies?.['refresh_token'];
    return this.authService.refresh(refreshToken);
  }
}