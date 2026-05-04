import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true })
export class Folder {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner_id!: Types.ObjectId;

    @Prop({ required: true })
    name!: string;

    @Prop({ default: '' })
    description!: string;
}

export const FolderSchema = SchemaFactory.createForClass(Folder)

FolderSchema.index({ owner_id: 1 })