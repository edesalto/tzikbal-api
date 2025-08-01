import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Preferences {
  @Prop({ default: 'en' })
  lang: string;

  @Prop({ default: 'auto', enum: ['dark', 'light', 'auto'] })
  theme: 'dark' | 'light' | 'auto';
}

const PreferencesSchema = SchemaFactory.createForClass(Preferences);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop()
  role: string;

  @Prop()
  phone: string;

  @Prop()
  picture: string;

  @Prop()
  version: number;

  @Prop({ default: 'local' })
  provider: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({
    type: PreferencesSchema,
    default: () => ({ lang: 'en', theme: 'auto' }),
  })
  preferences: Preferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
