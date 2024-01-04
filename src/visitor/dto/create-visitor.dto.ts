import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Site, Visitor } from '../entities/visitor.entity';

export class CreateVisitorDto implements Omit<Visitor, 'id'> {
  @IsNotEmpty()
  @IsEnum(Site)
  type: Site;

  @IsNotEmpty()
  @IsNumber()
  count: number;
}
