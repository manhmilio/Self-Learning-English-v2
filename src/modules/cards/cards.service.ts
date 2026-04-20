import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { StudySetsService } from '../study-sets/study-sets.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BulkCreateCardDto } from './dto/bulk-create-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    private studySetsService: StudySetsService,
  ) { }

  // ─── Create 1 card ─────────────────────────────────────────────────────────

  async create(studySetId: string, dto: CreateCardDto, userId: string): Promise<CardDocument> {
    // Kiểm tra set tồn tại và user là owner
    await this.checkOwnership(studySetId, userId);

    // Nếu không truyền order thì tự động đặt cuối
    const order = dto.order ?? (await this.getNextOrder(studySetId));

    const card = await this.cardModel.create({
      ...dto,
      order,
      study_set_id: new Types.ObjectId(studySetId),
    });

    // Cập nhật card_count trong study set
    await this.studySetsService.updateCardCount(studySetId, 1);

    return card;
  }

  // ─── Bulk create nhiều cards ───────────────────────────────────────────────

  async bulkCreate(studySetId: string, dto: BulkCreateCardDto, userId: string) {
    await this.checkOwnership(studySetId, userId);

    const startOrder = await this.getNextOrder(studySetId);

    const cardsToInsert = dto.cards.map((card, index) => ({
      ...card,
      study_set_id: new Types.ObjectId(studySetId),
      order: card.order ?? startOrder + index,
    }));

    const created = await this.cardModel.insertMany(cardsToInsert);

    // Cộng dồn card_count một lần thay vì gọi nhiều lần
    await this.studySetsService.updateCardCount(studySetId, dto.cards.length as any);

    return created;
  }

  // ─── Read: lấy tất cả cards của 1 set ─────────────────────────────────────

  async findByStudySet(studySetId: string, userId: string) {
    // Dùng findOne của StudySetsService để check quyền xem set
    await this.studySetsService.findOne(studySetId, userId);

    return this.cardModel
      .find({ study_set_id: new Types.ObjectId(studySetId) })
      .sort({ order: 1 })
      .select('-__v')
      .lean();
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(cardId: string, dto: UpdateCardDto, userId: string): Promise<CardDocument> {
    const card = await this.findCardAndCheckOwnership(cardId, userId);

    Object.assign(card, dto);
    return card.save();
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async remove(cardId: string, userId: string): Promise<void> {
    const card = await this.findCardAndCheckOwnership(cardId, userId);
    const studySetId = card.study_set_id.toString();

    await card.deleteOne();

    // Giảm card_count sau khi xóa
    await this.studySetsService.updateCardCount(studySetId, -1);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  // Lấy order tiếp theo (đặt card mới xuống cuối)
  private async getNextOrder(studySetId: string): Promise<number> {
    const last = await this.cardModel
      .findOne({ study_set_id: new Types.ObjectId(studySetId) })
      .sort({ order: -1 })
      .select('order')
      .lean();
    return last ? last.order + 1 : 0;
  }

  // Kiểm tra user có phải owner của set không
  private async checkOwnership(studySetId: string, userId: string): Promise<void> {
    const set = await this.studySetsService.findOne(studySetId, userId);
    // console.log('owner_id:', JSON.stringify(set.owner_id));
    // console.log('userId  :', userId);
    // console.log('match   :', set.owner_id.toString() === userId);
    // Lấy _id từ populated object hoặc ObjectId trực tiếp
    const ownerId = (set.owner_id as any)?._id
      ? (set.owner_id as any)._id.toString()
      : set.owner_id.toString();

    if (ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thêm card vào set này');
    }
  }

  // Tìm card và kiểm tra ownership qua set
  private async findCardAndCheckOwnership(cardId: string, userId: string): Promise<CardDocument> {
    const card = await this.cardModel.findById(cardId);
    if (!card) throw new NotFoundException('Card không tồn tại');

    await this.checkOwnership(card.study_set_id.toString(), userId);
    return card;
  }
}