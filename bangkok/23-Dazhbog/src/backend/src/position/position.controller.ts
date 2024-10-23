import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@ApiTags('Dazhbog')
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post('/open-position')
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Delete('/close-position:position_id')
  remove(@Param('position_id') position_id: number) {
    return this.positionService.remove(position_id);
  }

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get('/get-position:position_id')
  findOne(@Param('position_id') position_id: number) {
    return this.positionService.findOne(+position_id);
  }

  @Patch('/update-position:position_id')
  update(
    @Param('position_id') position_id: number,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.update(+position_id, updatePositionDto);
  }
}
