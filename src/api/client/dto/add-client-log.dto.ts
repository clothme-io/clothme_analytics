import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ErrorReturnType, IErrorReturnType } from 'src/shared/types/ErrorReturnType';

export class AddClientLogDTOInput {

  @ApiProperty({
    description: 'Language for the account',
    example: 'en',
  })
  @IsString({ message: 'Language must be a string' })
  @IsNotEmpty({ message: 'Language is required' })
  accountId: string;

  @ApiProperty({
    description: 'Date for the account',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsString({ message: 'Date must be a string in ISO format' })
  @IsNotEmpty({ message: 'Date is required' })
  createdAt: string;

  @ApiProperty({
    description: 'Payload for the account',
    example: { 'dark': true },
  })
  @IsObject({ message: 'Payload must be an object' })
  payload: object;

}

export class AddClientLogDTOResponseData {
  @ApiProperty({
    description: 'Unique identifier for the job',
    example: 'job_12345',
  })
  @IsString({ message: 'Id must be a string' })
  @IsNotEmpty({ message: 'Id is required' })
  jobId: string;

  @ApiProperty({
    description: 'Unique identifier for the account',
    example: 'acc_12345',
  })
  @IsString({ message: 'Id must be a string' })
  @IsNotEmpty({ message: 'Id is required' })
  accountId: string;

  @ApiProperty({
    description: 'Date when the job was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsString({ message: 'Created at must be a string' })
  @IsNotEmpty({ message: 'Created at is required' })
  createdAt: string;

}

export class AddClientLogDTOResponse {
  @ApiProperty({
    description: 'Operation success status',
    example: 201,
  })
  status: number;

  @ApiProperty({
    description: 'Response error',
    type: ErrorReturnType,
    required: false
  })
  error: IErrorReturnType | null;

  @ApiProperty({
    description: 'Response data',
    type: AddClientLogDTOResponseData,
    required: false,
  })
  data: AddClientLogDTOResponseData | null;
}