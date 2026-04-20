import { IsString, IsOptional, IsNumber, MinLength, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCardDto {
  @IsString()
  @MinLength(1, { message: 'Mặt trước không được để trống' })
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  front!: string;

  @IsString()
  @MinLength(1, { message: 'Mặt sau không được để trống' })
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  back!: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order?: number;
}