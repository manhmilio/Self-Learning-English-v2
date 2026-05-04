import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export class StartSessionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  study_set_id!: string;

  @ApiProperty({ enum: ['flashcard', 'learn', 'test', 'match'], example: 'learn' })
  @IsEnum(['flashcard', 'learn', 'test', 'match'], {
    message: 'mode phải là flashcard, learn, test hoặc match',
  })
  mode!: string;
}