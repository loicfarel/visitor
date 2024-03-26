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
import { count } from 'console';
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

export const ACTORS_GENERATE = 10;
export const TOTAL_CHOICES = 4;
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
    const actors = await this.ActorModel.aggregate([
      { $match: { birthday: { $exists: true, $ne: null } } },
    ]);

    return {
      // actors,
      count: actors.length,
    };
  }

  findByBirthday(date: string): Promise<Actor[]> {
    try {
      const birthday = moment(date, 'YYYY-MM-DD');
      const day = birthday.date();
      const month = birthday.month() + 1;

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

  // Get random actors
  async getRandomActors(count: number): Promise<Actor[]> {
    const actors = await this.ActorModel.aggregate([
      { $match: { birthday: { $exists: true, $ne: null } } },
      { $sample: { size: count } },
      {
        $project: { name: 1, profile_path: 1, birthday: 1, _id: 0, gender: 1 },
      },
    ]);
    return actors;
  }

  // Generate choice for actor
  generateChoices(actor: Actor, totalChoices: number): Partial<Actor[]> {
    const choices = [] as Actor[];

    for (let i = 0; i < totalChoices; i++) {
      const actorCopy = { ...actor }; // Créer une copie de l'acteur à chaque itération
      if (i === 0) {
        choices.push(actorCopy);
      } else {
        actorCopy.birthday = this.generateFakeBirthday(actorCopy.birthday);
        choices.push(actorCopy);
      }
    }

    return choices;
  }

  async generateActorsWithQuizzes(count: number): Promise<Actor[][]> {
    const actors = await this.getRandomActors(count);
    const quizzes = [] as Actor[][];

    for (const actor of actors) {
      const quiz = this.generateChoices(actor, TOTAL_CHOICES);
      quizzes.push(quiz);
    }

    return quizzes;
  }

  generateFakeBirthday(originalBirthday: string): string {
    const fakeAge = new Date(originalBirthday);
    fakeAge.setFullYear(
      fakeAge.getFullYear() + Math.floor(Math.random() * 12) + 1,
    );
    return fakeAge.toISOString().slice(0, 10);
  }

  // Name Quizz
  async generateActorsAndFakeNames(count: number): Promise<any[][]> {
    const actors = await this.getRandomActors(count);
    const quizzes = [];

    for (const actor of actors) {
      const fakeNames = await this.generateFakeNames(
        actor.gender,
        actor.name,
        3,
      );
      const quiz = [actor, ...fakeNames];
      quizzes.push(quiz);
    }

    return quizzes;
  }

  async generateFakeNames(
    gender: number,
    originalName: string,
    count: number,
  ): Promise<Partial<Actor>[]> {
    const fakeNames = await this.ActorModel.aggregate([
      { $match: { gender, name: { $ne: originalName } } }, // Exclure le nom original de l'acteur
      { $sample: { size: count } },
      {
        $project: { name: 1, profile_path: 1, birthday: 1, gender: 1, _id: 0 },
      },
    ]);
    return fakeNames;
  }
}
