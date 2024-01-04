import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitorModule } from './visitor/visitor.module';

@Module({
  imports: [VisitorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
