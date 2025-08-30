// src/shared/config/click-house/clickhouse-schema.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';

@Injectable()
export class ClickHouseSchemaService implements OnModuleInit {
  private readonly logger = new Logger(ClickHouseSchemaService.name);
  
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async onModuleInit() {
    try {
      // Check if the table exists before creating it
      const tableExists = await this.checkTableExists('analytics_events');
      
      if (!tableExists) {
        this.logger.log('Creating analytics_events table in ClickHouse');
        await this.createAnalyticsEventsTable();
        this.logger.log('Successfully created analytics_events table');
      } else {
        this.logger.log('analytics_events table already exists in ClickHouse');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to initialize ClickHouse schema: ${errorMessage}`, errorStack);
    }
  }

  async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const query = `
        SELECT name 
        FROM system.tables 
        WHERE database = currentDatabase() 
        AND name = '${tableName}'
      `;
      
      const result = await this.clickHouseService.query<{ name: string }>(query);
      return result.length > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error checking if table exists: ${errorMessage}`, errorStack);
      return false;
    }
  }

  async createAnalyticsEventsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS analytics_events (
        user_id String,
        session_id String,
        timestamp DateTime64(3),
        location String,
        event_type String,
        event_source String,
        ai_size_data JSON,
        user_size_adjustments JSON,
        product_id Nullable(String),
        product_attributes JSON,
        recommendation_metadata JSON,
        interaction_details JSON,
        user_feedback JSON,
        conversion_outcome JSON,
        search_query Nullable(String),
        device_info JSON,
        network_type LowCardinality(String),
        error_details JSON,
        user_demographics JSON,
        transaction_details JSON
      )
      ENGINE = MergeTree()
      PARTITION BY toYYYYMMDD(timestamp)
      ORDER BY (timestamp, user_id)
      SETTINGS index_granularity = 8192;
    `;

    try {
      await this.clickHouseService.query(createTableQuery);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create analytics_events table: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async dropTable(tableName: string): Promise<void> {
    try {
      await this.clickHouseService.query(`DROP TABLE IF EXISTS ${tableName}`);
      this.logger.log(`Table ${tableName} dropped successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to drop table ${tableName}: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
