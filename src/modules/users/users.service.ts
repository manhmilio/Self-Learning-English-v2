import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email.toLowerCase() });
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id);
    }

    async create(data: { email: string; username: string; password_hash: string }): Promise<UserDocument> {
        // Kiểm tra email/username trùng trước khi tạo
        const exists = await this.userModel.findOne({
            $or: [{ email: data.email }, { username: data.username }],
        });
        if (exists) {
            const field = exists.email === data.email ? 'Email' : 'Username';
            throw new ConflictException(`${field} đã được sử dụng`);
        }
        return this.userModel.create(data);
    }
}