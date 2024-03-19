import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  id: true,
  collection: 'actors',
  versionKey: false,
  toJSON: {
    virtuals: true,

    transform(_: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.updatedAt;
      delete ret.__v;
    },
  },
})
export class Actor {
  id: string;

  @Prop()
  name: string;

  @Prop()
  role: string;

  @Prop()
  birthday: string;

  @Prop()
  deathday: string;

  @Prop()
  gender: number;

  @Prop({ required: true, unique: true })
  idApi: number;

  @Prop()
  popularity: number;

  @Prop()
  profile_path: string;

  @Prop()
  idImdbd: string;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);

export type ActorDocument = Actor & Document;
