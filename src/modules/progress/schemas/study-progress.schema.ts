import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudyProgressDocument = StudyProgress & Document;

@Schema({ timestamps: true })
export class StudyProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Card', required: true })
  card_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudySet', required: true })
  study_set_id!: Types.ObjectId;

  @Prop({ enum: ['flashcard', 'learn', 'test'], required: true })
  mode!: string;

  @Prop({ enum: ['not_started', 'learning', 'known'], default: 'not_started' })
  status!: string;

  @Prop({ default: 2.5 })
  ease_factor!: number;

  @Prop({ default: 0 })
  interval!: number; // đơn vị: ngày

  @Prop({ default: 0 })
  streak!: number;

  @Prop({ default: null })
  last_reviewed!: Date;

  @Prop({ default: null })
  next_review!: Date;
}

export const StudyProgressSchema = SchemaFactory.createForClass(StudyProgress);

// Compound unique: mỗi (user, card, mode) chỉ có 1 document
StudyProgressSchema.index({ user_id: 1, card_id: 1, mode: 1 }, { unique: true });

// Query cards cần ôn hôm nay
StudyProgressSchema.index({ user_id: 1, next_review: 1, status: 1 });

// Query toàn bộ progress của 1 set
StudyProgressSchema.index({ user_id: 1, study_set_id: 1, mode: 1 });