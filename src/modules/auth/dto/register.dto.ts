import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username chỉ gồm chữ, số, dấu gạch dưới' })
    username!: string;

    @IsString()
    @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
    password!: string;
}