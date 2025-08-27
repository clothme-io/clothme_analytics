import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AddClientLogDTOInput, AddClientLogDTOResponseData } from '../../dto/add-client-log.dto';


@Injectable()
export class AddClientLogRedisService {
  private readonly logger = new Logger(AddClientLogRedisService.name);
  private queueEvents: QueueEvents;

  constructor(
    @InjectQueue('add-client-log') private addClientLogQueue: Queue,
    private configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    console.log('QueueEvents using Redis URL:', redisUrl);
    
    // Parse the Redis URL for connection options
    const url = new URL(redisUrl);
    
    this.queueEvents = new QueueEvents('add-client-log', {
      connection: {
        host: url.hostname,
        port: parseInt(url.port),
        password: url.password,
        username: url.username || 'default',
      }
    });
  }

  async addClientLog(jobId: string, body: AddClientLogDTOInput): Promise<AddClientLogDTOResponseData> {
    try {
      this.logger.log(`Creating job to add client for account ${body.accountId}`);

      // Create a job in the queue
      await this.addClientLogQueue.add('processAddClientLogPostgresDB', { jobId, body }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });

      this.logger.log(`Created job ${jobId} for account ${body.accountId}`);

      return {
        jobId: jobId,
        accountId: body.accountId,
        createdAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(
        `Failed to create client: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
