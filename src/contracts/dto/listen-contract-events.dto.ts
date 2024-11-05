import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ListenContractEventsDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  startBlock: number;
}
