import { IsNotEmpty } from 'class-validator';

export class CreateCyborNftDto {

  @IsNotEmpty()
  readonly cyborNFTID: string;

  @IsNotEmpty()
  readonly chain: string;

  @IsNotEmpty()
  readonly state: number;

  readonly enemiesDefeated: number;

  readonly highestDefense: number;

  readonly highestSurvival: number;
}