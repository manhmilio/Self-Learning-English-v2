import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudySessionDocument = StudySession & Document;

@Schema({ timestamps: true })
export class StudySession {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudySet', required: true })
    study_set_id!: Types.ObjectId;

    @Prop({ enum: ['flashcard', 'learn', 'test', 'match'], required: true })
    mode!: string;

    @Prop({ default: 0 })
    score!: number; // số card trả lời đúng

    @Prop({ default: 0 })
    total_cards!: number; // tổng số card trong session

    @Prop({ default: null })
    ended_at!: Date;

    createdAt!: Date;
    updatedAt!: Date;
}

export const StudySessionSchema = SchemaFactory.createForClass(StudySession);

StudySessionSchema.index({ user_id: 1, createdAt: -1 });
StudySessionSchema.index({ user_id: 1, study_set_id: 1 });