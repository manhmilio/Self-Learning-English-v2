import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StudySetsService } from './study-sets.service';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { QueryStudySetDto } from './dto/query-study-set.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';   

@Controller('study-sets')
export class StudySetsController {
  constructor(private studySetsService: StudySetsService) {}

@Post()
create(@Body() dto: CreateStudySetDto, @CurrentUser('userId') userId: string) {
  return this.studySetsService.create(dto, userId);
}

@Get('me')
findMySets(@Query() query: QueryStudySetDto, @CurrentUser('userId') userId: string) {
  return this.studySetsService.findMyStudySets(userId, query);
}

@Public()
@Get('public')
findPublicSets(@Query() query: QueryStudySetDto) {
  return this.studySetsService.findPublicStudySets(query);
}

@Get(':id')
findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  return this.studySetsService.findOne(id, userId);
}

@Patch(':id')
update(
  @Param('id') id: string,
  @Body() dto: UpdateStudySetDto,
  @CurrentUser('userId') userId: string,
) {
  return this.studySetsService.update(id, dto, userId);
}

@Delete(':id')
remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  return this.studySetsService.remove(id, userId);
}
}