import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { LogEventDto } from './add-client-eventlog.dto';
import { ErrorReturnType, IErrorReturnType } from 'src/shared/types/ErrorReturnType';

export class GetEventLogsQueryDto {
  @ApiProperty({
    description: 'Account ID to filter logs',
    example: 'acc_12345',
    required: true
  })
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Job ID to retrieve a specific log',
    example: 'job_12345',
    required: false
  })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiProperty({
    description: 'User ID to filter logs',
    example: 'user_67890',
    required: false
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Event type to filter logs',
    example: 'page_view',
    required: false
  })
  @IsString()
  @IsOptional()
  eventType?: string;
}

export class EventLogItem {
  @ApiProperty({
    description: 'Unique job ID for the log entry',
    example: 'job_12345'
  })
  jobId: string;

  @ApiProperty({
    description: 'Account ID associated with the log',
    example: 'acc_12345'
  })
  accountId: string;

  @ApiProperty({
    description: 'Timestamp when the log was created',
    example: '2023-01-01T12:00:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'The event log data',
    type: LogEventDto
  })
  payload: LogEventDto;
}

export class GetEventLogsResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: 200
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
    type: [EventLogItem],
    required: false
  })
  data: EventLogItem[] | null;
}
