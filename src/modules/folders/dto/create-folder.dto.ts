import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFolderDto {
  @IsString()
  @MinLength(1, { message: 'Tên folder không được để trống' })
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}