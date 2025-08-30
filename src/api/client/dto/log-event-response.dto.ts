import { ApiProperty } from '@nestjs/swagger';
import { ErrorReturnType, IErrorReturnType } from 'src/shared/types/ErrorReturnType';

export class LogEventResponseData {
  @ApiProperty({
    description: 'Unique identifier for the job',
    example: 'job_12345',
  })
  jobId: string;

  @ApiProperty({
    description: 'User identifier',
    example: 'user_67890',
  })
  userId: string;

  @ApiProperty({
    description: 'Type of event',
    example: 'page_view',
  })
  eventType: string;

  @ApiProperty({
    description: 'Event timestamp',
    example: '2023-01-01T12:00:00.000Z',
  })
  timestamp: string;
}

export class LogEventResponseDto {
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
    type: LogEventResponseData,
    required: false,
  })
  data: LogEventResponseData | null;
}
