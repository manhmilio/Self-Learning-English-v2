import {
  Controller, Get, Post,
  Body, Param, Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ReviewCardDto } from './dto/review-card.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  // POST /api/progress/review
  @Post('review')
  reviewCard(
    @Body() dto: ReviewCardDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.progressService.reviewCard(dto, userId);
  }

  // GET /api/progress/due?mode=learn
  // Phải đặt trước /:studySetId để không bị match nhầm
  @Get('due')
  getDueCards(
    @Query() query: QueryProgressDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.progressService.getDueCards(userId, query);
  }

  // GET /api/progress/:studySetId?mode=learn
  @Get(':studySetId')
  getStudySetProgress(
    @Param('studySetId') studySetId: string,
    @Query() query: QueryProgressDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.progressService.getStudySetProgress(studySetId, userId, query);
  }
}