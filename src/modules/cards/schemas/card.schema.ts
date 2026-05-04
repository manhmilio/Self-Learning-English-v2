import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
    @Prop({ type: Types.ObjectId, ref: 'StudySet', required: true })
    study_set_id!: Types.ObjectId;

    @Prop({ required: true, trim: true })
    front!: string;

    @Prop({ required: true, trim: true })
    back!: string;

    @Prop({ default: null })
    image_url!: string;

    @Prop({ default: 0 })
    order!: number;
}

export const CardSchema = SchemaFactory.createForClass(Card)

CardSchema.index({ study_set_id: 1, order: 1 });