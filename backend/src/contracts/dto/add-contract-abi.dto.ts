import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddContractAbiDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsArray()
  abi: any[];
}
