import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ErrorReturnType, IErrorReturnType } from 'src/shared/types/ErrorReturnType';

export class AddClientLogDTOInput {

  @ApiProperty({
    description: 'Account identifier',
    example: 'acc_12345',
    default: 'acc_default',
  })
  @IsString({ message: 'Account ID must be a string' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: string;

  @ApiProperty({
    description: 'Timestamp when the log was created',
    example: '2023-01-01T00:00:00.000Z',
    default: new Date().toISOString(),
  })
  @IsString({ message: 'Date must be a string in ISO format' })
  @IsNotEmpty({ message: 'Date is required' })
  createdAt: string;

  @ApiProperty({
    description: 'Log data payload containing client analytics information',
    example: { 'event': 'page_view', 'page': '/home', 'dark_mode': true, 'session_duration': 120 },
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