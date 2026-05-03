import {
  Controller, Get, Post,
  Body, Param, Query,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { QuerySessionDto } from './dto/query-session.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  // POST /api/sessions/start
  @ApiOperation({ summary: 'Bắt đầu phiên học mới' })
  @ApiResponse({ status: 201, description: 'Tạo session thành công' })
  @ApiResponse({ status: 400, description: 'Đang có session chưa kết thúc' })
  @Post('start')
  startSession(
    @Body() dto: StartSessionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sessionsService.startSession(dto, userId);
  }

  // POST /api/sessions/:id/end
  @ApiOperation({ summary: 'Kết thúc phiên học, lưu kết quả' })
  @ApiResponse({ status: 200, description: 'Trả về kết quả: score, accuracy, duration' })
  @ApiResponse({ status: 400, description: 'Session đã kết thúc rồi' })
  @ApiResponse({ status: 404, description: 'Session không tồn tại' })
  @Post(':id/end')
  endSession(
    @Param('id') id: string,
    @Body() dto: EndSessionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sessionsService.endSession(id, dto, userId);
  }

  // GET /api/sessions/stats
  // Đặt trước /:id để không bị match nhầm
  @ApiOperation({ summary: 'Thống kê tổng hợp — streak, accuracy, tổng sessions' })
  @Get('stats')
  getStats(@CurrentUser('userId') userId: string) {
    return this.sessionsService.getStats(userId);
  }

  // GET /api/sessions/history?mode=learn&page=1&limit=20
  @ApiOperation({ summary: 'Lịch sử các phiên học đã hoàn thành' })
  @ApiQuery({ name: 'mode', required: false, enum: ['flashcard', 'learn', 'test', 'match'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Get('history')
  getHistory(
    @Query() query: QuerySessionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sessionsService.getHistory(userId, query);
  }
}