import { IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewCardDto {
  @IsString()
  card_id!: string;

  @IsString()
  study_set_id!: string;

  @IsEnum(['flashcard', 'learn', 'test'], {
    message: 'mode phải là flashcard, learn hoặc test',
  })
  mode!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'quality tối thiểu là 0' })
  @Max(5, { message: 'quality tối đa là 5' })
  quality!: number;
  // 0-2: sai, 3-5: đúng (5=nhớ ngay, 4=nhớ tốt, 3=nhớ được, 2=sai nhưng nhớ ra, 1=sai khó nhớ, 0=không nhớ)
}