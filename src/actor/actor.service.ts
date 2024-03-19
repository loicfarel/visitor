import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto';
import { Actor, ActorDocument } from './entities/actor.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
export interface FileLineError {
  lineNumber: number;
  error: string;
}

export interface RawReceivedFile {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string;
  deathday: string;
  gender: number;
  homepage: string;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
}
@Injectable()
export class ActorService {
  constructor(
    @InjectModel(Actor.name)
    private readonly ActorModel: Model<ActorDocument>,
  ) {}
  async processReceivedJsonFile(file: Express.Multer.File) {
    const fileProcessingErrors: FileLineError[] = [];

    try {
      // Step 1: Read raw data from file buffer and parse to json
      const fullFileContent: RawReceivedFile[] = JSON.parse(
        file.buffer.toString(),
      );

      const fileContent = fullFileContent;
      // console.log('fileContent:', fileContent);
      if (fileContent.length <= 0)
        throw new NotAcceptableException(
          'The provided list is empty, cannot proceed',
        );

      try {
        // Step 6: Create the beneficiary in database
        const accountCreationResult = await Promise.allSettled(
          fileContent.map((actor, index) =>
            this.create(
              {
                name: actor.name,
                profile_path: actor.profile_path,
                idApi: actor.id,
                role: actor.known_for_department,
                idImdbd: actor.imdb_id,
                popularity: actor.popularity,
                gender: actor.gender,
                birthday: actor.birthday,
                deathday: actor.deathday,
              },
              index + 1,
              fileProcessingErrors,
            ),
          ),
        );

        if (accountCreationResult.some((res) => res.status === 'rejected'))
          throw new Error('A Actor creation failed');

        return 'Created';
      } catch (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException)
        throw new NotAcceptableException(
          {
            message: 'A actor in the file already exist in the database',
            fileProcessingErrors,
          },
          (error as any).response,
        );
      if (error instanceof NotAcceptableException) throw error;
      throw new InternalServerErrorException({
        message: 'Failed to process received file',
        fileProcessingErrors,
      });
    }
  }
  async create(
    createActorDto: CreateActorDto,
    lineNumber?: number,
    errorArr?: FileLineError[],
  ) {
    try {
      return await this.ActorModel.create(createActorDto);
    } catch (error) {
      errorArr?.push({
        error: error.toString(),
        lineNumber,
      });
    }
  }

  async findAll() {
    return await this.ActorModel.find().exec();
  }

  findByBirthday(date: string): Promise<Actor[]> {
    try {
      const birthday = moment(date, 'YYYY-MM-DD');
      console.log('birthday:', birthday);
      const day = birthday.date();
      console.log('day:', day);
      const month = birthday.month() + 1;
      console.log('month:', month);

      return this.ActorModel.find({
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: { $toDate: '$birthday' } }, day] },
            { $eq: [{ $month: { $toDate: '$birthday' } }, month] },
          ],
        },
      }).exec();
    } catch (error) {
      console.error(error);
    }
  }
}
