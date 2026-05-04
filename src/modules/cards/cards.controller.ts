import {
  Controller, Get, Post, Patch, Delete,
  Body, Param,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BulkCreateCardDto } from './dto/bulk-create-card.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class CardsController {
  constructor(private cardsService: CardsService) {}

  // POST /api/study-sets/:studySetId/cards
  @Post('study-sets/:studySetId/cards')
  create(
    @Param('studySetId') studySetId: string,
    @Body() dto: CreateCardDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.cardsService.create(studySetId, dto, userId);
  }

  // POST /api/study-sets/:studySetId/cards/bulk
  @Post('study-sets/:studySetId/cards/bulk')
  bulkCreate(
    @Param('studySetId') studySetId: string,
    @Body() dto: BulkCreateCardDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.cardsService.bulkCreate(studySetId, dto, userId);
  }

  // GET /api/study-sets/:studySetId/cards
  @Get('study-sets/:studySetId/cards')
  findByStudySet(
    @Param('studySetId') studySetId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.cardsService.findByStudySet(studySetId, userId);
  }

  // PATCH /api/cards/:id
  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.cardsService.update(id, dto, userId);
  }

  // DELETE /api/cards/:id
  @Delete('cards/:id')
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.cardsService.remove(id, userId);
  }
}