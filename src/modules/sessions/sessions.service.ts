import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudySession, StudySessionDocument } from './schemas/study-session.schema';
import { StudySetsService } from '../study-sets/study-sets.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { QuerySessionDto } from './dto/query-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(StudySession.name)
    private sessionModel: Model<StudySessionDocument>,
    private studySetsService: StudySetsService,
  ) {}

  // ─── Bắt đầu session mới ───────────────────────────────────────────────────

  async startSession(dto: StartSessionDto, userId: string): Promise<StudySessionDocument> {
    // Kiểm tra set tồn tại và user có quyền xem
    const set = await this.studySetsService.findOne(dto.study_set_id, userId);

    // Kiểm tra không có session nào đang dở dang (chưa end)
    const ongoing = await this.sessionModel.findOne({
      user_id: new Types.ObjectId(userId),
      study_set_id: new Types.ObjectId(dto.study_set_id),
      mode: dto.mode,
      ended_at: null,
    });
    if (ongoing) {
      throw new BadRequestException(
        'Bạn đang có session chưa kết thúc, hãy kết thúc session cũ trước',
      );
    }

    return this.sessionModel.create({
      user_id: new Types.ObjectId(userId),
      study_set_id: new Types.ObjectId(dto.study_set_id),
      mode: dto.mode,
      total_cards: set.card_count,
    });
  }

  // ─── Kết thúc session ──────────────────────────────────────────────────────

  async endSession(sessionId: string, dto: EndSessionDto, userId: string) {
    const session = await this.findOneOwner(sessionId, userId);

    if (session.ended_at) {
      throw new BadRequestException('Session này đã kết thúc rồi');
    }

    if (dto.score > dto.total_cards) {
      throw new BadRequestException('Score không thể lớn hơn total_cards');
    }

    session.score = dto.score;
    session.total_cards = dto.total_cards;
    session.ended_at = new Date();
    await session.save();

    // Tính accuracy và trả về kết quả tổng kết
    const accuracy = Math.round((dto.score / dto.total_cards) * 100);

    return {
      session_id: session._id,
      mode: session.mode,
      score: session.score,
      total_cards: session.total_cards,
      accuracy,        // % đúng
      duration_seconds: this.calcDuration(session.createdAt as Date, session.ended_at),
      ended_at: session.ended_at,
    };
  }

  // ─── Lịch sử học của mình ──────────────────────────────────────────────────

  async getHistory(userId: string, query: QuerySessionDto) {
    const { mode, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      user_id: new Types.ObjectId(userId),
      ended_at: { $ne: null }, // chỉ lấy session đã kết thúc
    };
    if (mode) filter.mode = mode;

    const [data, total] = await Promise.all([
      this.sessionModel
        .find(filter)
        .sort({ createdAt: -1 }) // mới nhất trước
        .skip(skip)
        .limit(limit)
        .populate('study_set_id', 'title') // lấy thêm title của set
        .lean(),
      this.sessionModel.countDocuments(filter),
    ]);

    // Thêm accuracy vào mỗi session
    const dataWithAccuracy = data.map((s) => ({
      ...s,
      accuracy: s.total_cards > 0
        ? Math.round((s.score / s.total_cards) * 100)
        : 0,
      duration_seconds: this.calcDuration(s.createdAt as Date, s.ended_at),
    }));

    return {
      data: dataWithAccuracy,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Thống kê tổng hợp ─────────────────────────────────────────────────────

  async getStats(userId: string) {
    const userObjId = new Types.ObjectId(userId);

    const [totalSessions, streakData, accuracyData, modeData] = await Promise.all([
      // Tổng số session đã hoàn thành
      this.sessionModel.countDocuments({
        user_id: userObjId,
        ended_at: { $ne: null },
      }),

      // Tính streak — số ngày học liên tiếp
      this.sessionModel
        .find({ user_id: userObjId, ended_at: { $ne: null } })
        .sort({ createdAt: -1 })
        .select('createdAt')
        .lean(),

      // Accuracy trung bình
      this.sessionModel.aggregate([
        { $match: { user_id: userObjId, ended_at: { $ne: null }, total_cards: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avg_accuracy: {
              $avg: { $multiply: [{ $divide: ['$score', '$total_cards'] }, 100] },
            },
            total_cards_studied: { $sum: '$total_cards' },
          },
        },
      ]),

      // Phân bổ theo mode
      this.sessionModel.aggregate([
        { $match: { user_id: userObjId, ended_at: { $ne: null } } },
        { $group: { _id: '$mode', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total_sessions: totalSessions,
      streak_days: this.calcStreak(streakData.map((s) => s.createdAt as Date)),
      avg_accuracy: accuracyData[0]
        ? Math.round(accuracyData[0].avg_accuracy)
        : 0,
      total_cards_studied: accuracyData[0]?.total_cards_studied ?? 0,
      sessions_by_mode: modeData.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async findOneOwner(id: string, userId: string): Promise<StudySessionDocument> {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Session không tồn tại');
    if (session.user_id.toString() !== userId) {
      throw new NotFoundException('Session không tồn tại');
      // Trả về 404 thay vì 403 để không lộ thông tin session của người khác
    }
    return session;
  }

  private calcDuration(start: Date, end: Date): number {
    if (!start || !end) return 0;
    return Math.round((end.getTime() - start.getTime()) / 1000);
  }

  // Tính số ngày học liên tiếp tính từ hôm nay
  private calcStreak(dates: Date[]): number {
    if (!dates.length) return 0;

    // Lấy danh sách ngày unique (không tính giờ)
    const uniqueDays = [
      ...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0])),
    ].sort().reverse(); // mới nhất trước

    const today = new Date().toISOString().split('T')[0];

    // Nếu hôm nay chưa học thì streak = 0
    if (uniqueDays[0] !== today) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const current = new Date(uniqueDays[i]);
      const prev = new Date(uniqueDays[i - 1]);
      const diffDays = Math.round(
        (prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break; // chuỗi bị gián đoạn
      }
    }

    return streak;
  }
}