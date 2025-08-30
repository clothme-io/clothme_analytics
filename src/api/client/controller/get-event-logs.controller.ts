/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Headers, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { GetEventLogsRedisService } from '../service/redis/get-event-logs-redis.service';
import { GetEventLogsQueryDto, GetEventLogsResponseDto } from '../dto/get-event-logs.dto';

@ApiTags('client')
@ApiBearerAuth('Authorization')
@ApiSecurity('X-token')
@Controller('client')
export class GetEventLogsController {
    private readonly logger = new Logger(GetEventLogsController.name);

    constructor(
        private readonly getEventLogsRedisService: GetEventLogsRedisService,
    ) {}

    @Get('event-logs')
    @ApiOperation({ 
        summary: 'Get event logs',
        description: 'Retrieves event logs from the analytics database'
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
    @ApiQuery({
        name: 'accountId',
        description: 'Account ID to filter logs',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'jobId',
        description: 'Job ID to retrieve a specific log',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'userId',
        description: 'User ID to filter logs',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'eventType',
        description: 'Event type to filter logs',
        required: false,
        type: String
    })
    @ApiResponse({
        status: 200,
        description: 'Event logs retrieved successfully',
        type: GetEventLogsResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Missing required parameters',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async getEventLogs(
        @Headers() headers: Record<string, string>,
        @Query() query: GetEventLogsQueryDto,
    ): Promise<GetEventLogsResponseDto> {
        this.logger.log(`Received request to get event logs for account: ${query.accountId}`);

        try {
            // Validate accountId is provided
            if (!query.accountId) {
                this.logger.warn('Request missing required accountId parameter');
                return {
                    status: 400,
                    error: {
                        message: 'Account ID is required',
                        status: 400,
                    },
                    data: null
                };
            }

            // If jobId is provided, get event log by jobId
            if (query.jobId) {
                this.logger.log(`Getting event log by jobId ${query.jobId}`);
                
                // Validate jobId format
                const isValidFormat = /^[a-zA-Z0-9_-]+$/i.test(query.jobId);
                
                if (!isValidFormat) {
                    this.logger.warn(`Invalid jobId format: ${query.jobId}`);
                    return {
                        status: 400,
                        error: {
                            message: `Invalid jobId format: ${query.jobId}`,
                            status: 400,
                        },
                        data: null
                    };
                }
                
                // Attempt to retrieve the event log by job ID
                const eventLog = await this.getEventLogsRedisService.getEventLogByJobId(query.jobId);
                
                if (!eventLog) {
                    this.logger.warn(`Event log with jobId ${query.jobId} not found`);
                    return {
                        status: 404,
                        error: {
                            message: `Event log with jobId ${query.jobId} not found`,
                            status: 404,
                        },
                        data: null
                    };
                }
                
                // Return the found event log
                return {
                    status: 200,
                    error: null,
                    data: [eventLog]
                };
            }
            
            // Otherwise, retrieve logs by filters
            try {
                const logs = await this.getEventLogsRedisService.getEventLogs(
                    query.accountId,
                    query.userId,
                    query.eventType
                );
                
                this.logger.log(`Successfully retrieved ${logs.length} event logs for account: ${query.accountId}`);
                
                return {
                    status: 200,
                    error: null,
                    data: logs
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Error retrieving logs by filter: ${errorMessage}`);
                return {
                    status: 500,
                    error: {
                        message: 'Error retrieving event logs',
                        status: 500,
                    },
                    data: null
                };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error retrieving event logs: ${errorMessage}`,
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
