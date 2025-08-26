/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobType } from 'bullmq';

// Define interfaces for type safety
interface ClientLogJobData {
  body: {
    accountId?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface JobResult {
  id: string;
  data: ClientLogJobData;
  status: string;
  progress: any; // Using any for JobProgress since it can be various types
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  stacktrace?: string[];
  returnvalue?: any;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface FilterOptions {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

@Injectable()
export class ReadClientLogRedisService {
  private readonly logger = new Logger(ReadClientLogRedisService.name);

  constructor(
    @InjectQueue('add-client-log') private readonly addClientLogQueue: Queue<ClientLogJobData>,
  ) {}

  /**
   * Get job by ID from the queue
   * @param jobId The ID of the job to retrieve
   * @returns The job data or null if not found
   */
  async getJobById(jobId: string): Promise<JobResult | null> {
    try {
      const job = await this.addClientLogQueue.getJob(jobId);
      if (!job) {
        this.logger.warn(`Job with ID ${jobId} not found`);
        return null;
      }
      
      return {
        id: job.id,
        data: job.data,
        status: await job.getState(),
        progress: job.progress,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        returnvalue: job.returnvalue,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error retrieving job ${jobId}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Get jobs with pagination and filtering options
   * @param paginationOptions Page number and limit
   * @param filterOptions Optional filters like accountId, date range, status
   * @returns Paginated list of jobs
   */
  async getJobs(
    paginationOptions: PaginationOptions,
    filterOptions?: FilterOptions,
  ): Promise<{ jobs: JobResult[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10 } = paginationOptions;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      // Get jobs based on status if provided
      let jobs: Job<ClientLogJobData>[] = [];
      if (filterOptions?.status) {
        // Use status string as JobType
        const status = filterOptions.status as JobType;
        jobs = await this.addClientLogQueue.getJobs([status], start, end);
      } else {
        // Get all jobs if no status filter
        const activeJobs = await this.addClientLogQueue.getJobs(['active' as JobType], start, end);
        const waitingJobs = await this.addClientLogQueue.getJobs(['waiting' as JobType], start, end);
        const completedJobs = await this.addClientLogQueue.getJobs(['completed' as JobType], start, end);
        const failedJobs = await this.addClientLogQueue.getJobs(['failed' as JobType], start, end);
        
        jobs = [...activeJobs, ...waitingJobs, ...completedJobs, ...failedJobs];
        
        // Sort by timestamp (newest first)
        jobs.sort((a, b) => b.timestamp - a.timestamp);
        
        // Apply limit after sorting
        jobs = jobs.slice(0, limit);
      }

      // Apply additional filters
      if (filterOptions) {
        jobs = jobs.filter(job => {
          const data = job.data.body || {};
          
          // Filter by accountId if provided
          if (filterOptions.accountId && data.accountId !== filterOptions.accountId) {
            return false;
          }
          
          // Filter by date range if provided
          if (filterOptions.startDate || filterOptions.endDate) {
            const jobDate = new Date(job.timestamp);
            
            if (filterOptions.startDate && jobDate < new Date(filterOptions.startDate)) {
              return false;
            }
            
            if (filterOptions.endDate && jobDate > new Date(filterOptions.endDate)) {
              return false;
            }
          }
          
          return true;
        });
      }

      // Format job data for response
      const formattedJobs = await Promise.all(
        jobs.map(async (job) => ({
          id: job.id,
          data: job.data,
          status: await job.getState(),
          progress: job.progress,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
        })),
      );

      // Get total count for pagination
      const totalJobs = await this.getQueueCount();

      return {
        jobs: formattedJobs,
        total: totalJobs,
        page,
        limit,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error retrieving jobs: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Get jobs by account ID
   * @param accountId The account ID to filter by
   * @param paginationOptions Page number and limit
   * @returns Paginated list of jobs for the specified account
   */
  async getJobsByAccountId(
    accountId: string,
    paginationOptions: PaginationOptions,
  ): Promise<{ jobs: JobResult[]; total: number; page: number; limit: number }> {
    return this.getJobs(paginationOptions, { accountId });
  }

  /**
   * Get queue statistics
   * @returns Object with counts of jobs in different states
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const waiting = await this.addClientLogQueue.getWaitingCount();
      const active = await this.addClientLogQueue.getActiveCount();
      const completed = await this.addClientLogQueue.getCompletedCount();
      const failed = await this.addClientLogQueue.getFailedCount();
      const delayed = await this.addClientLogQueue.getDelayedCount();
      const total = waiting + active + completed + failed + delayed;

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error retrieving queue stats: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Get total count of jobs in the queue
   * @returns Total number of jobs
   */
  private async getQueueCount(): Promise<number> {
    try {
      const stats = await this.getQueueStats();
      return stats.total;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error getting queue count: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Clean completed and failed jobs from the queue
   * @param grace Time in milliseconds to keep jobs (default: 24 hours)
   * @returns Number of jobs removed
   */
  async cleanQueue(grace: number = 24 * 60 * 60 * 1000): Promise<number> {
    try {
      // Convert string to number for the second parameter
      const result = await this.addClientLogQueue.clean(grace, 0); // 0 for completed jobs
      const failedResult = await this.addClientLogQueue.clean(grace, 2); // 2 for failed jobs
      
      const totalRemoved = (result?.length || 0) + (failedResult?.length || 0);
      this.logger.log(`Cleaned ${totalRemoved} jobs from the queue`);
      return totalRemoved;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error cleaning queue: ${err.message}`, err.stack);
      throw err;
    }
  }
}