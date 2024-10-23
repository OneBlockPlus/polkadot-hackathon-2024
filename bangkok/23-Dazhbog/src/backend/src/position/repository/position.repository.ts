import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';

@Injectable()
export class PositionRepository {
  constructor(
    @InjectModel(Position.name) private readonly positionModel: Model<Position>,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    return (await this.positionModel.create(createPositionDto)).save();
  }

  async update(
    position_id: number,
    updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    const tempPosition = await this.positionModel.findOne({ position_id });
    //TODO get current price from oracle
    const currentPrice = 100;
    let updatedPosition;

    //TODO fix adding/removing amount
    if (tempPosition.amount < updatePositionDto.amount) {
      updatedPosition = await this.positionModel.findOneAndUpdate(
        { position_id },
        {
          amount: tempPosition.amount + updatePositionDto.amount,
          position_value:
            tempPosition.position_value +
            updatePositionDto.amount * currentPrice,
        },
        { new: true },
      );
    } else {
      updatedPosition = await this.positionModel.findOneAndUpdate(
        { position_id },
        {
          amount: tempPosition.amount - updatePositionDto.amount,
          position_value:
            tempPosition.position_value -
            updatePositionDto.amount * currentPrice,
        },
        { new: true },
      );
    }

    return updatedPosition;
  }

  async findOne(position_id: number) {
    return await this.positionModel.findOne({position_id});
  }

  async delete(position_id: number) {
    return await this.positionModel.findOneAndDelete({ position_id });
  }

  async findAllPositionByUser(user: string) {
    const positions = await this.positionModel.find({
      user,
    });

    if (!positions) {
      throw new NotFoundException(`Position not found`);
    }

    return positions.map((ship) =>
      ship.toObject({
        transform(doc, ret) {
          delete ret.__v;
          delete ret._id;
        },
      }),
    );
  }

  async findAll(): Promise<Position[]> {
    const positions = await this.positionModel.find().exec();
    if (!positions) {
      throw new NotFoundException(`Position not found`);
    }

    return positions.map((position) =>
      position.toObject({
        transform(doc, ret) {
          delete ret.__v;
          delete ret._id;
          // delete ret.$__;
          // delete ret.$isNew;
        },
      }),
    );
  }
}
