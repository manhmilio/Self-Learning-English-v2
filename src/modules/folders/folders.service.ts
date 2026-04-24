import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Folder, FolderDocument } from './schemas/folder.schema';
import { StudySetsService } from '../study-sets/study-sets.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
    private studySetsService: StudySetsService,
  ) { }

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(dto: CreateFolderDto, userId: string): Promise<FolderDocument> {
    return this.folderModel.create({
      ...dto,
      owner_id: new Types.ObjectId(userId),
    });
  }

  // ─── Read: danh sách folders của mình ─────────────────────────────────────

  async findMyFolders(userId: string) {
    return this.folderModel
      .find({ owner_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
  }

  // ─── Read: chi tiết folder kèm danh sách sets bên trong ───────────────────

  async findOne(id: string, userId: string) {
    const folder = await this.folderModel.findById(id).select('-__v').lean();
    if (!folder) throw new NotFoundException('Folder không tồn tại');

    const isOwner = folder.owner_id.toString() === userId;
    if (!isOwner) throw new ForbiddenException('Bạn không có quyền xem folder này');

    // Lấy tất cả sets thuộc folder này
    const sets = await this.studySetsService.findByFolderId(id, userId);

    return { ...folder, sets };
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateFolderDto, userId: string): Promise<FolderDocument> {
    const folder = await this.findOneOwner(id, userId);
    Object.assign(folder, dto);
    return folder.save();
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    const folder = await this.findOneOwner(id, userId);
    // Gỡ folder_id khỏi tất cả sets trước khi xóa
    await this.studySetsService.removeFolderFromSets(id);
    await folder.deleteOne();
  }

  // ─── Thêm set vào folder ───────────────────────────────────────────────────

  async addSet(folderId: string, setId: string, userId: string): Promise<void> {
    await this.findOneOwner(folderId, userId);

    const isOwner = await this.studySetsService.isOwner(setId, userId);
    if (!isOwner) {
      throw new ForbiddenException('Bạn không có quyền thêm set này vào folder');
    }

    const set = await this.studySetsService.findOne(setId, userId);
    if (set.folder_id && set.folder_id.toString() !== folderId) {
      throw new BadRequestException('Set đang thuộc folder khác, hãy gỡ ra trước');
    }

    await this.studySetsService.assignFolder(setId, folderId);
  }

  // ─── Gỡ set khỏi folder ───────────────────────────────────────────────────

  async removeSet(folderId: string, setId: string, userId: string): Promise<void> {
    await this.findOneOwner(folderId, userId);
    await this.studySetsService.assignFolder(setId, null);
  }

  // ─── Helper ────────────────────────────────────────────────────────────────

  private async findOneOwner(id: string, userId: string): Promise<FolderDocument> {
    const folder = await this.folderModel.findById(id);
    if (!folder) throw new NotFoundException('Folder không tồn tại');
    if (folder.owner_id.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa folder này');
    }
    return folder;
  }
}