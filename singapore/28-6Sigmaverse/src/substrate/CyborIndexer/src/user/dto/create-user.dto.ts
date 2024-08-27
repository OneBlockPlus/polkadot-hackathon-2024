import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  readonly chain: string;

  readonly email: string;

  readonly tg: string;

  readonly x: string;
}