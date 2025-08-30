import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EventLogItem } from '../../dto/get-event-logs.dto';
import { LogEventDto } from '../../dto/add-client-eventlog.dto';

// Define interfaces for job data structure
interface JobData {
  jobId: string;
  body: {
    accountId?: string;
    userId?: string;
    eventType?: string;
    payload?: Record<string, any>;
    createdAt?: string;
    body?: {
      accountId?: string;
      userId?: string;
      eventType?: string;
    };
  };
}

@Injectable()
export class GetEventLogsRedisService {
  private readonly logger = new Logger(GetEventLogsRedisService.name);
  private queueEvents: QueueEvents;

  /**
   * Validates if an object has the minimum required fields to be considered a LogEventDto
   * @param obj The object to validate
   * @returns true if the object has minimum required fields, false otherwise
   */
  private hasMinimumLogEventFields(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    
    const payload = obj as Record<string, unknown>;
    
    // Check for minimum required fields in LogEventDto
    return (
      'userId' in payload && typeof payload.userId === 'string' &&
      'sessionId' in payload && typeof payload.sessionId === 'string' &&
      'timestamp' in payload && typeof payload.timestamp === 'string' &&
      'location' in payload && typeof payload.location === 'string' &&
      'eventType' in payload && typeof payload.eventType === 'string'
    );
  }

  constructor(
    @InjectQueue('add-client-log') private eventLogQueue: Queue,
    private configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.logger.log('QueueEvents using Redis URL:', redisUrl);
    
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

  async getEventLogByJobId(jobId: string): Promise<EventLogItem | null> {
    try {
      if (!jobId || typeof jobId !== 'string') {
        this.logger.error(`Invalid job ID provided: ${jobId}`);
        return null;
      }
      
      this.logger.log(`Retrieving event log for job ${jobId}`);

      // Try different job ID formats
      this.logger.log(`Attempting to find job with ID ${jobId}`);
      
      // First try direct job ID
      let job = await this.eventLogQueue.getJob(jobId) as Job<JobData> | undefined;
      
      // If not found, try with the job name prefix
      if (!job) {
        this.logger.log(`Job not found with direct ID, trying with job name prefix`);
        job = await this.eventLogQueue.getJob('processAddClientLogPostgresDB:' + jobId) as Job<JobData> | undefined;
      }
      
      // If still not found, try searching all jobs by data.jobId
      if (!job) {
        this.logger.log(`Job not found with prefix, searching all jobs by data.jobId`);
        // Get all jobs and properly type them
        const allJobs = await this.eventLogQueue.getJobs(['completed', 'active', 'waiting']) as Job<JobData>[];
        
        // Use proper type checking before accessing properties
        job = allJobs.find(j => {
          try {
            // Safely check if the job data contains the jobId we're looking for
            return j && j.data && 'jobId' in j.data && j.data.jobId === jobId;
          } catch (err) {
            this.logger.error(`Error checking job data: ${err instanceof Error ? err.message : String(err)}`);
            return false;
          }
        });
      }
      
      if (!job) {
        this.logger.log(`Job ${jobId} not found after trying all methods`);
        return null;
      }
      
      this.logger.log(`Successfully found job ${jobId}`);

      const data = job.data;
      if (!data) {
        this.logger.log(`Job ${jobId} has no data`);
        return null;
      }
      
      if (!data.body) {
        this.logger.log(`Job ${jobId} has no body in data`);
        return null;
      }

      const bodyData = data.body;
      
      // Ensure timestamp is a number
      const timestamp = job.timestamp !== undefined ? Number(job.timestamp) : Date.now();
      
      // Create a properly typed payload with validation
      const rawPayload = bodyData.payload || bodyData;
      
      // Check if payload has minimum required fields
      if (!this.hasMinimumLogEventFields(rawPayload)) {
        this.logger.warn(`Job ${jobId} has incomplete payload structure`);
        // Still return data but log the warning
      }
      
      // Create event log with properly typed payload
      const eventLog: EventLogItem = {
        jobId: data.jobId || jobId,
        accountId: bodyData.accountId || bodyData.body?.accountId || '',
        createdAt: bodyData.createdAt || new Date(timestamp).toISOString(),
        payload: rawPayload as LogEventDto
      };

      this.logger.log(`Successfully retrieved event log for job ${jobId}`);
      return eventLog;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(
        `Failed to retrieve event log by job ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getEventLogs(accountId: string, userId?: string, eventType?: string): Promise<EventLogItem[]> {
    try {
      this.logger.log(`Retrieving event logs for account ${accountId}`);

      // Get all jobs from the queue
      const jobs = await this.eventLogQueue.getJobs(['completed', 'active', 'waiting']);
      
      // Get typed jobs

      // Filter and map jobs based on criteria
      const filteredLogs = jobs
        .filter((job: Job) => {
          if (!job.data) return false;
          const data = job.data as JobData;
          if (!data || !data.body) return false;
          
          const bodyData = data.body;
          
          // Filter by accountId
          if (bodyData.accountId !== accountId && bodyData.body?.accountId !== accountId) {
            return false;
          }
          
          // Filter by userId if provided
          if (userId && bodyData.body?.userId !== userId) {
            return false;
          }
          
          // Filter by eventType if provided
          if (eventType && bodyData.body?.eventType !== eventType) {
            return false;
          }
          
          return true;
        })
        .map((job: Job) => {
          if (!job.data) return {} as EventLogItem;
          const data = job.data as JobData;
          const bodyData = data.body;
          
          // Ensure timestamp is a number
          const timestamp: number = typeof job.timestamp === 'number' ? job.timestamp : Date.now();
          
          // Create a properly typed payload
          const rawPayload = bodyData.payload || bodyData;
          
          return {
            jobId: data.jobId,
            accountId: bodyData.accountId || bodyData.body?.accountId || '',
            createdAt: bodyData.createdAt || new Date(timestamp).toISOString(),
            payload: rawPayload as LogEventDto
          } as EventLogItem;
        });

      this.logger.log(`Found ${filteredLogs.length} event logs for account ${accountId}`);
      return filteredLogs;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(
        `Failed to retrieve event logs: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
