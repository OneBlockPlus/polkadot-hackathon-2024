import { IsNotEmpty } from 'class-validator';

export class StartFightCyborNftDto {
  @IsNotEmpty()
  readonly nftID: number;
  
  @IsNotEmpty()
  readonly cyborNFTID: string;

  @IsNotEmpty()
  readonly chain: string;
  
  @IsNotEmpty()
  readonly mode: string; // story; survival; defense;

  @IsNotEmpty()
  readonly storyId: string;
}