import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyProgress, StudyProgressDocument } from './schemas/study-progress.schema';
import { StudySetsService } from '../study-sets/study-sets.service';
import { CardsService } from '../cards/cards.service';
import { ReviewCardDto } from './dto/review-card.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { calculateSM2 } from './utils/sm2.util';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(StudyProgress.name)
    private progressModel: Model<StudyProgressDocument>,
    private studySetsService: StudySetsService,
    private cardsService: CardsService,
  ) {}

  // ─── Review 1 card — tính SM-2 và upsert progress ─────────────────────────

  async reviewCard(dto: ReviewCardDto, userId: string) {
    const { card_id, study_set_id, mode, quality } = dto;

    // Tìm progress hiện tại nếu đã có
    const existing = await this.progressModel.findOne({
      user_id: new Types.ObjectId(userId),
      card_id: new Types.ObjectId(card_id),
      mode,
    });

    // Lấy giá trị hiện tại hoặc dùng mặc định nếu lần đầu học
    const current = {
      quality,
      ease_factor: existing?.ease_factor ?? 2.5,
      interval: existing?.interval ?? 0,
      streak: existing?.streak ?? 0,
    };

    // Tính toán SM-2
    const result = calculateSM2(current);

    // Upsert — tạo mới nếu chưa có, update nếu đã có
    const progress = await this.progressModel.findOneAndUpdate(
      {
        user_id: new Types.ObjectId(userId),
        card_id: new Types.ObjectId(card_id),
        mode,
      },
      {
        $set: {
          study_set_id: new Types.ObjectId(study_set_id),
          status: result.status,
          ease_factor: result.ease_factor,
          interval: result.interval,
          streak: result.streak,
          last_reviewed: new Date(),
          next_review: result.next_review,
        },
      },
      { upsert: true, new: true },
    );

    return {
      card_id,
      status: result.status,
      interval: result.interval,
      streak: result.streak,
      next_review: result.next_review,
    };
  }

  // ─── Lấy progress của tất cả cards trong 1 set ────────────────────────────

  async getStudySetProgress(studySetId: string, userId: string, query: QueryProgressDto) {
    // Kiểm tra quyền xem set
    await this.studySetsService.findOne(studySetId, userId);

    // Lấy tất cả cards của set
    const cards = await this.cardsService.findByStudySetInternal(studySetId);

    // Lấy progress hiện tại của user cho set này
    const progressFilter: Record<string, any> = {
      user_id: new Types.ObjectId(userId),
      study_set_id: new Types.ObjectId(studySetId),
    };
    if (query.mode) progressFilter.mode = query.mode;

    const progressList = await this.progressModel
      .find(progressFilter)
      .lean();

    // Map progress theo card_id để lookup O(1)
    const progressMap = new Map(
      progressList.map((p) => [p.card_id.toString(), p]),
    );

    const now = new Date();

    // Gộp cards với progress, gán priority để sort
    const merged = cards.map((card) => {
      const cardId = (card as any)._id.toString();
      const progress = progressMap.get(cardId);

      if (!progress) {
        return {
          card,
          status: 'not_started',
          next_review: null,
          streak: 0,
          interval: 0,
          priority: 0, // ưu tiên cao nhất
        };
      }

      const isDue = progress.next_review && progress.next_review <= now;

      return {
        card,
        status: progress.status,
        next_review: progress.next_review,
        streak: progress.streak,
        interval: progress.interval,
        priority:
          progress.status === 'not_started' ? 0  // chưa học
          : isDue ? 1                             // đến hạn ôn
          : progress.status === 'learning' ? 2    // đang học chưa đến hạn
          : 3,                                    // known
      };
    });

    // Sắp xếp theo priority
    merged.sort((a, b) => a.priority - b.priority);

    // Thống kê tổng hợp
    const stats = {
      total: cards.length,
      not_started: merged.filter((c) => c.status === 'not_started').length,
      learning: merged.filter((c) => c.status === 'learning').length,
      known: merged.filter((c) => c.status === 'known').length,
      due_today: merged.filter((c) => c.priority === 1).length,
    };

    return { stats, cards: merged };
  }

  // ─── Lấy tất cả cards cần ôn hôm nay (across tất cả sets) ─────────────────

  async getDueCards(userId: string, query: QueryProgressDto) {
    const now = new Date();

    const filter: Record<string, any> = {
      user_id: new Types.ObjectId(userId),
      next_review: { $lte: now },
      status: { $ne: 'not_started' },
    };
    if (query.mode) filter.mode = query.mode;

    const dueProgress = await this.progressModel
      .find(filter)
      .sort({ next_review: 1 }) // ôn cái lâu nhất chưa ôn trước
      .populate('card_id')
      .populate('study_set_id', 'title')
      .lean();

    return {
      total_due: dueProgress.length,
      cards: dueProgress.map((p) => ({
        card: p.card_id,
        study_set: p.study_set_id,
        mode: p.mode,
        status: p.status,
        next_review: p.next_review,
        streak: p.streak,
      })),
    };
  }
}