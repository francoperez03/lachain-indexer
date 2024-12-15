import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class GetEventLogsDto {
  contractAddress: string;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsNumber()
  fromBlock?: number;

  @IsOptional()
  @IsNumber()
  toBlock?: number;

  @IsOptional()
  @IsString()
  parameterName?: string;

  @IsOptional()
  @IsString()
  parameterValue?: string;

  @IsOptional()
  @IsIn(['blockNumber', 'logIndex', 'createdAt'])
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




// eventName?: string; 
// fromBlock?: number;
// toBlock?: number;
// parameterName?: string; // nombre del parametro
// parameterValue?: string; // valores de parametro
// sortBy?: string;
// sortDirection?: string;
// page?: number;
// limit?: number;



// fromBlock?: number;
// toBlock?: number;
// fromAddress?: string;
// toAddress?: string;
// sortBy?: string;
// sortDirection?: string;
// page?: number;
// limit?: number;