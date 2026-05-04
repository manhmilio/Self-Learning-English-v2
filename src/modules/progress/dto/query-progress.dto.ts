import { IsEnum, IsOptional } from 'class-validator';

export class QueryProgressDto {
  @IsOptional()
  @IsEnum(['flashcard', 'learn', 'test'], {
    message: 'mode phải là flashcard, learn hoặc test',
  })
  mode?: string;
}