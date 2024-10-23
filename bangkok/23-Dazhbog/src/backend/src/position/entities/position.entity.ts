import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PositionType } from '../dto/create-position.dto';

@Schema()
export class Position extends Document {
  @Prop({ required: true })
  position_id: number;

  @Prop({ required: true })
  state: boolean;

  @Prop({ required: true })
  token: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  leverage: number;

  @Prop({ required: false, default: PositionType.LONG })
  position_type: PositionType;

  @Prop({ required: true })
  position_value: number;

  @Prop({ required: true })
  user: string;

  @Prop({ required: false, default: Date.now })
  creation_time: number;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
