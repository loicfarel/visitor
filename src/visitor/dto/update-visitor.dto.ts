import { PartialType } from '@nestjs/mapped-types';
import { CreateVisitorDto } from './create-visitor.dto';
import { Site } from '../entities/visitor.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateVisitorDto implements Omit<CreateVisitorDto, 'count'> {
  @IsNotEmpty()
  @IsEnum(Site)
  type: Site;
}
