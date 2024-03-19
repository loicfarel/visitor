import { Actor } from '../entities/actor.entity';
import { IsNumber, IsString } from 'class-validator';

export class CreateActorDto implements Omit<Actor, 'id'> {
  @IsString()
  name: string;

  @IsString()
  profile_path: string;

  @IsString()
  role: string;

  @IsNumber()
  idApi: number;

  @IsNumber()
  popularity: number;

  @IsNumber()
  gender: number;

  @IsString()
  birthday: string;

  @IsString()
  deathday: string;

  @IsString()
  idImdbd: string;
}
