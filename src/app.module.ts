import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitorModule } from './visitor/visitor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ActorModule } from './actor/actor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    VisitorModule,
    ActorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
