import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class IndexContractEventsDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  startBlock: bigint;
}
