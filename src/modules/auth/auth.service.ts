import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            email: dto.email,
            username: dto.username,
            password_hash,
        });
        return this.generateTokens(user._id.toString(), user.email, user.role);
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        const isValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        return this.generateTokens(user._id.toString(), user.email, user.role);
    }

    private generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES'), // 15m
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES'), // 7d
        });

        return { accessToken, refreshToken };
    }

    // Authorization refresh token
    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Không tìm thấy refresh token');
        }

        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
            });

            // Kiểm tra user vẫn còn tồn tại
            const user = await this.usersService.findById(payload.sub);
            if (!user) throw new UnauthorizedException('User không tồn tại');

            // Cấp accessToken mới
            const accessToken = this.jwtService.sign(
                { sub: user._id, email: user.email, role: user.role },
                {
                    secret: this.config.get<string>('JWT_ACCESS_SECRET')!,
                    expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
                },
            );

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }
}