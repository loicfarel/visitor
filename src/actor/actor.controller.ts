import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  NotAcceptableException,
} from '@nestjs/common';
import { ACTORS_GENERATE, ActorService } from './actor.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { Actor } from './entities/actor.entity';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  // @Get('/all')
  // findAllActor() {
  //   return this.actorService.findAll();
  // }

  @Get('/quizz-name')
  generateQuizzName(): Promise<Actor[][]> {
    return this.actorService.generateActorsAndFakeNames(ACTORS_GENERATE);
  }
  @Get('/quizz-age')
  generateQuizzAge(): Promise<Actor[][]> {
    return this.actorService.generateActorsWithQuizzes(ACTORS_GENERATE);
  }

  @Get(':date')
  findAll(@Param('date') date: string) {
    return this.actorService.findByBirthday(date);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    type: String,
  })
  @Post()
  create(@UploadedFile() file: Express.Multer.File) {
    const fileExtension = extname(file.originalname);

    if (!['.json'].includes(fileExtension)) {
      throw new NotAcceptableException(
        'The provided file type is not supported',
      );
    }
    return this.actorService.processReceivedJsonFile(file);
  }
}
