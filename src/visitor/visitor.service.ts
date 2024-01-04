import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { Site, Visitor } from './entities/visitor.entity';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class VisitorService {
  constructor(
    @InjectModel(Visitor.name)
    private visitorModel: mongoose.Model<Visitor>,
  ) {}
  async create(createVisitorDto: CreateVisitorDto) {
    return await this.visitorModel.create(createVisitorDto);
  }

  findAll() {
    return `This action returns all visitor`;
  }

  findOne(type: Site) {
    return this.visitorModel.findOne({ type });
  }

  async update(updateVisitorDto: UpdateVisitorDto) {
    const site = await this.findOne(updateVisitorDto.type);
    console.log('site:', site);
    return this.visitorModel.updateOne(
      { type: site.type },
      { count: site.count + 1 },
    );
  }

  //   remove(type: Site) {
  //     return `This action removes a #${type} visitor`;
  //   }
}
