# ClickHouse Integration for ClothME Analytics

This document provides information on how to use the ClickHouse integration in the ClothME Analytics service.

## Overview

ClickHouse is used as a high-performance analytics database to store and query event data. The integration includes:

1. Connection configuration via environment variables
2. Schema management with automatic table creation
3. Data insertion and query capabilities
4. CLI commands for database management

## Configuration

### Environment Variables

Set the following environment variables in your `.env` file:

```
CLICKHOUSE_URL=http://your-clickhouse-host:8123
CLICKHOUSE_DB=your_database
CLICKHOUSE_USER=your_username
CLICKHOUSE_PASSWORD=your_password
```

### Schema Structure

The main analytics table is `analytics_events` with the following structure:

```sql
CREATE TABLE analytics_events (
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
```

## Usage

### Initializing the Schema

To initialize the ClickHouse schema:

```bash
npm run cli:init-clickhouse
```

This command will create the `analytics_events` table if it doesn't already exist.

### Inserting Data

To insert event data into ClickHouse, use the `ClickHouseService`:

```typescript
import { Injectable } from '@nestjs/common';
import { ClickHouseService } from 'src/shared/config/click-house/clickhouse.service';
import { LogEventDto } from 'src/api/client/dto/add-client-eventlog.dto';

@Injectable()
export class YourService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async logEvent(event: LogEventDto): Promise<void> {
    await this.clickHouseService.bulkInsertEvents([event]);
  }

  async logMultipleEvents(events: LogEventDto[]): Promise<void> {
    await this.clickHouseService.bulkInsertEvents(events);
  }
}
```

### Querying Data

To query data from ClickHouse:

```typescript
import { Injectable } from '@nestjs/common';
import { ClickHouseService } from 'src/shared/config/click-house/clickhouse.service';

interface EventCount {
  event_type: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getEventCountsByType(): Promise<EventCount[]> {
    const query = `
      SELECT 
        event_type, 
        count() as count 
      FROM analytics_events 
      GROUP BY event_type 
      ORDER BY count DESC
    `;
    
    return this.clickHouseService.query<EventCount>(query);
  }

  async getEventsForUser(userId: string): Promise<any[]> {
    const query = `
      SELECT * 
      FROM analytics_events 
      WHERE user_id = '${userId}'
      ORDER BY timestamp DESC
    `;
    
    return this.clickHouseService.query(query);
  }
}
```

## Schema Management

The `ClickHouseSchemaService` provides methods for managing the database schema:

- `checkTableExists(tableName: string)`: Check if a table exists
- `createAnalyticsEventsTable()`: Create the analytics_events table
- `dropTable(tableName: string)`: Drop a table

## Automatic Schema Initialization

The schema is automatically initialized when the application starts because `ClickHouseSchemaService` implements `OnModuleInit`. If you want to disable this behavior, you can remove the `onModuleInit` method from the service.

## Performance Considerations

- ClickHouse is optimized for batch inserts. Try to batch events when possible.
- Use the appropriate data types for columns to optimize storage and query performance.
- Consider adding additional indices if you frequently query on specific columns.
- For large datasets, consider adjusting the partitioning strategy.

## Troubleshooting

If you encounter issues with the ClickHouse connection:

1. Verify your environment variables are correctly set
2. Ensure ClickHouse is running and accessible from your application
3. Check the logs for specific error messages
4. Verify that your user has the necessary permissions in ClickHouse

For more information on ClickHouse, refer to the [official documentation](https://clickhouse.com/docs).
