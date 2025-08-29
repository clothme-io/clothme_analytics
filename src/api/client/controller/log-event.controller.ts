/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Headers, Logger, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AddClientLogRedisService } from '../service/redis/add-client-log-redis.service';
import { LogEventDto } from '../dto/add-client-eventlog.dto';
import { LogEventResponseDto } from '../dto/log-event-response.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('client')
@ApiBearerAuth('Authorization')
@ApiSecurity('X-token')
@Controller('client')
export class LogEventController {
    private readonly logger = new Logger(LogEventController.name);

    constructor(
        private readonly addClientLogRedisService: AddClientLogRedisService,
    ) {}

    @Post('log-event')
    @ApiOperation({ 
        summary: 'Log client event',
        description: 'Records a client event in the analytics database'
    })
    @ApiHeader({
        name: 'Content-Type',
        description: 'Content type of the request',
        required: true,
        schema: { default: 'application/json' }
    })
    @ApiHeader({
        name: 'Accept',
        description: 'Accepted response type',
        required: false,
        schema: { default: 'application/json' }
    })
    @ApiResponse({
        status: 201,
        description: 'Event logged successfully',
        type: LogEventResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Missing required parameters',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async logClientEvent(
        @Headers() headers: Record<string, string>,
        @Query('accountId') accountId: string,
        @Body() body: LogEventDto,
    ): Promise<LogEventResponseDto> {
        this.logger.log(`Received request to log client event for account: ${accountId}, user: ${body.userId}`);

        const jobId = uuidv4();

        try {
            if (!accountId) {
                return {
                    status: 400,
                    error: {
                        message: 'Account ID is required',
                        status: 400,
                    },
                    data: null
                };
            }

            // For now, we'll reuse the existing service method
            // In a real implementation, you would create a dedicated service method for event logging
            const response = await this.addClientLogRedisService.addClientLog(jobId, {
                accountId: accountId,
                createdAt: body.timestamp,
                payload: body
            });
            
            this.logger.log(`Successfully logged client event for account: ${accountId}, user: ${body.userId}`);
            
            return {
                status: 201,
                error: null,
                data: {
                    jobId: response.jobId,
                    userId: body.userId,
                    eventType: body.eventType,
                    timestamp: body.timestamp
                }
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error logging client event: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            return {
                status: 500,
                error: {
                    message: errorMessage,
                    status: 500,
                },
                data: null
            };
        }
    }
}
