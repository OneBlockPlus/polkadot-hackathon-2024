import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { PositionRepository } from './repository/position.repository';
import { Position, PositionSchema } from './entities/position.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [PositionController],
  providers: [PositionService, PositionRepository],
})
export class PositionModule {}
