import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudySet, StudySetDocument } from './schemas/study-set.schema';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { QueryStudySetDto } from './dto/query-study-set.dto';

@Injectable()
export class StudySetsService {
    constructor(
        @InjectModel(StudySet.name) private studySetModel: Model<StudySetDocument>,
    ) { }

    // ─── Create ────────────────────────────────────────────────────────────────

    async create(dto: CreateStudySetDto, userId: string): Promise<StudySetDocument> {
        return this.studySetModel.create({
            ...dto,
            owner_id: new Types.ObjectId(userId),
        });
    }

    // ─── Read: danh sách sets của chính mình ───────────────────────────────────

    async findMyStudySets(userId: string, query: QueryStudySetDto) {
        const { search, tag, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {
            owner_id: new Types.ObjectId(userId),
        };

        if (tag) filter.tags = tag;

        // Full-text search nếu có từ khóa
        if (search) {
            filter.$text = { $search: search };
        }

        const [data, total] = await Promise.all([
            this.studySetModel
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .lean({ virtuals: true }), // thêm lean()
            this.studySetModel.countDocuments(filter),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ─── Read: tìm kiếm sets công khai ────────────────────────────────────────

    async findPublicStudySets(query: QueryStudySetDto) {
        const { search, tag, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = { is_public: true };

        if (tag) filter.tags = tag;

        if (search) {
            filter.$text = { $search: search };
        }

        const [data, total] = await Promise.all([
            this.studySetModel
                .find(filter)
                .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v')
                .populate('owner_id', 'username avatar_url')
                .lean({ virtuals: true }), // thêm lean()
            this.studySetModel.countDocuments(filter),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ─── Read: chi tiết 1 set ──────────────────────────────────────────────────

    async findOne(id: string, userId: string): Promise<StudySetDocument> {
        const studySet = await this.studySetModel
            .findById(id)
            .populate('owner_id', 'username avatar_url')
            .select('-__v')
            .lean({ virtuals: true }); // thêm lean()

        if (!studySet) throw new NotFoundException('Study set không tồn tại');

        // Set private thì chỉ owner mới xem được
        const isOwner = studySet.owner_id.toString() === userId;
        if (!studySet.is_public && !isOwner) {
            throw new ForbiddenException('Bạn không có quyền xem study set này');
        }

        return studySet;
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    async update(id: string, dto: UpdateStudySetDto, userId: string): Promise<StudySetDocument> {
        const studySet = await this.findOneOwner(id, userId);

        Object.assign(studySet, dto);
        return studySet.save();
    }

    // ─── Delete ────────────────────────────────────────────────────────────────

    async remove(id: string, userId: string): Promise<void> {
        const studySet = await this.findOneOwner(id, userId);
        await studySet.deleteOne();
    }

    // ─── Internal: dùng bởi CardsService để cập nhật card_count ───────────────

    async updateCardCount(studySetId: string, delta: 1 | -1): Promise<void> {
        await this.studySetModel.findByIdAndUpdate(studySetId, {
            $inc: { card_count: delta },
        });
    }

    // ─── Helper: tìm set và kiểm tra ownership ─────────────────────────────────

    private async findOneOwner(id: string, userId: string): Promise<StudySetDocument> {
        const studySet = await this.studySetModel.findById(id);

        if (!studySet) throw new NotFoundException('Study set không tồn tại');

        if (studySet.owner_id.toString() !== userId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa study set này');
        }

        return studySet;
    }
}