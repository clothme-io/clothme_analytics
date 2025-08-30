// src/cli/commands/init-clickhouse-schema.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { ClickHouseSchemaService } from '../../shared/config/click-house/clickhouse-schema.service';

@Command({
  name: 'init-clickhouse-schema',
  description: 'Initialize ClickHouse schema with required tables',
})
@Injectable()
export class InitClickHouseSchemaCommand extends CommandRunner {
  constructor(private readonly clickHouseSchemaService: ClickHouseSchemaService) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Checking if analytics_events table exists...');
      const tableExists = await this.clickHouseSchemaService.checkTableExists('analytics_events');
      
      if (tableExists) {
        console.log('analytics_events table already exists');
      } else {
        console.log('Creating analytics_events table...');
        await this.clickHouseSchemaService.createAnalyticsEventsTable();
        console.log('Successfully created analytics_events table');
      }
      
      process.exit(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize ClickHouse schema:', errorMessage);
      process.exit(1);
    }
  }
}
