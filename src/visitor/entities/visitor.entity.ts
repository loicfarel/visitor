import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Site {
  PORTFOLIO = 'portfolio',
}
@Schema({
  id: true,
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,

    transform(_: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret._v;
    },
  },
})
export class Visitor {
  id: string;

  @Prop({ required: true, unique: true })
  type: Site;

  @Prop({ required: true })
  count: number;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);
export type VisitorDocument = Document & Visitor;
