import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { Site } from './entities/visitor.entity';

@Controller('visitor')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Post()
  create(@Body() createVisitorDto: CreateVisitorDto) {
    return this.visitorService.create(createVisitorDto);
  }

  @Get()
  findAll() {
    return this.visitorService.findAll();
  }

  @Get('site')
  findOne(@Param('site') site: Site) {
    return this.visitorService.findOne(site);
  }

  @Patch()
  update(@Body() updateVisitorDto: UpdateVisitorDto) {
    return this.visitorService.update(updateVisitorDto);
  }

  // @Delete(':site')
  // remove(@Param('site') site: Site) {
  //   return this.visitorService.remove(site);
  // }
}
