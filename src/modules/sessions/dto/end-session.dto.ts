import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EndSessionDto {
  @ApiProperty({ example: 8, description: 'Số card trả lời đúng' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  score!: number;

  @ApiProperty({ example: 10, description: 'Tổng số card trong session' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  total_cards!: number;
}