import {
  Controller, Get, Post, Patch, Delete,
  Body, Param,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('folders')
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  // POST /api/folders
  @Post()
  create(@Body() dto: CreateFolderDto, @CurrentUser('userId') userId: string) {
    return this.foldersService.create(dto, userId);
  }

  // GET /api/folders/me
  @Get('me')
  findMyFolders(@CurrentUser('userId') userId: string) {
    return this.foldersService.findMyFolders(userId);
  }

  // GET /api/folders/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.foldersService.findOne(id, userId);
  }

  // PATCH /api/folders/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.foldersService.update(id, dto, userId);
  }

  // DELETE /api/folders/:id
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.foldersService.remove(id, userId);
  }

  // POST /api/folders/:id/sets/:setId
  @Post(':id/sets/:setId')
  addSet(
    @Param('id') folderId: string,
    @Param('setId') setId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.foldersService.addSet(folderId, setId, userId);
  }

  // DELETE /api/folders/:id/sets/:setId
  @Delete(':id/sets/:setId')
  removeSet(
    @Param('id') folderId: string,
    @Param('setId') setId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.foldersService.removeSet(folderId, setId, userId);
  }
}