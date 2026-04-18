import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, unique: true, trim: true })
    username!: string;

    @Prop({ required: true })
    @Exclude()
    password_hash!: string;

    @Prop({ default: null })
    avatar_url!: string;

    @Prop({ enum: ['user', 'admin'], default: 'user' })
    role!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password_hash; 
    return ret;
  },
});