/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Headers, Logger, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { AddClientLogRedisService } from '../service/redis/add-client-log-redis.service';
import { AddClientLogDTOInput, AddClientLogDTOResponse } from '../dto/add-client-log.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Account')
@Controller('account')
export class AddClientLogController {
    private readonly logger = new Logger(AddClientLogController.name);

    constructor(
        private readonly addClientLogRedisService: AddClientLogRedisService,
    ) {}

    @Post('add-client-log')
    @ApiOperation({ summary: 'Add client log' })
    @ApiHeader({
        name: 'Authorization',
        description: 'Bearer token for authentication',
        required: true,
    })
    @ApiHeader({
        name: 'X-token',
        description: 'Token for authentication',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Client log added successfully',
        type: AddClientLogDTOResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request',
    })
    @ApiResponse({
        status: 404,
        description: 'Cart or cart item not found',
    })
    async addClientLog(
        @Headers() headers: Record<string, string>,
        @Query('accountId') accountId: string,
        @Body() body: AddClientLogDTOInput,
    ): Promise<AddClientLogDTOResponse> {
        this.logger.log(`Received request to add client log for account: ${accountId}`);

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

            // For adding item, we use the same addAccountCartItem method
            // The service will check if the item exists and increase quantity if it does
            const response = await this.addClientLogRedisService.addClientLog(jobId, body);
            
            this.logger.log(`Successfully added client log for account: ${accountId}`);
            
            return {
                status: 201,
                error: null,
                data: response
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error adding client log: ${errorMessage}`,
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