import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class GetTransactionsDto {
  contractAddress: string;

  @IsOptional()
  @IsNumber()
  fromBlock?: number;

  @IsOptional()
  @IsNumber()
  toBlock?: number;

  @IsOptional()
  @IsString()
  fromAddress?: string;

  @IsOptional()
  @IsString()
  toAddress?: string;

  @IsOptional()
  @IsIn(['blockNumber', 'createdAt'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
