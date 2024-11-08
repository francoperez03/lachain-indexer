import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
