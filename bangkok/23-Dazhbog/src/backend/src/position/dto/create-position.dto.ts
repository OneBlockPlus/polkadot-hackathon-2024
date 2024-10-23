import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsString,
} from 'class-validator';

export enum PositionType {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export class CreatePositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  position_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  state: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  token: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  leverage: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PositionType)
  position_type: PositionType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty()
  @IsNumber()
  position_value?: number;

  @ApiProperty()
  @IsNumber()
  creation_time?: number;
}
