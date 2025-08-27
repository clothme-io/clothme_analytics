// src/clickhouse/clickhouse.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { LogEventDto } from 'src/api/client/dto/add-client-eventlog.dto';

@Injectable()
export class ClickHouseService {
  constructor(@Inject('CLICKHOUSE_CLIENT') private readonly client: ClickHouseClient) {}

  async bulkInsertEvents(events: LogEventDto[]): Promise<void> {
    if (events.length === 0) return;

    try {
      await this.client.insert({
        table: 'analytics_events',
        values: events,
        format: 'JSONEachRow',
      });
    } catch (error) {
      console.error('ClickHouse insert failed:', error);
      throw new Error('Failed to insert events to ClickHouse');
    }
  }

  async query<T>(query: string): Promise<T[]> {
    const resultSet = await this.client.query({ query, format: 'JSONEachRow' });
    return resultSet.json<T>();
  }
}