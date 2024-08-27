import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {

  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  readonly chain: string;
}