import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { describe } from 'node:test';


export type StudySetDocument = StudySet & Document;

@Schema({ timestamps: true })
export class StudySet {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ default: '' })
    description!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner_id!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Folder', default: null })
    folder_id!: Types.ObjectId;

    @Prop({ default: false })
    is_public!: boolean;

    @Prop({ default: 0 })
    card_count!: number;
}

export const StudySetSchema = SchemaFactory.createForClass(StudySet);
// index
StudySetSchema.index({ owner_id: 1, is_public: 1 });
StudySetSchema.index({ tags: 1 });
StudySetSchema.index({ title: 'text', description: 'text' })

// Transform _id → id, bỏ __v khi serialize
StudySetSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});