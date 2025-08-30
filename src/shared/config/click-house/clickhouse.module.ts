// src/clickhouse/clickhouse.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@clickhouse/client';
import { ClickHouseService } from './clickhouse.service';
import { ClickHouseSchemaService } from './clickhouse-schema.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ClickHouseService,
    ClickHouseSchemaService,
    {
      provide: 'CLICKHOUSE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return createClient({
          url: configService.get<string>('CLICKHOUSE_URL') || 'http://localhost:8123',
          database: configService.get<string>('CLICKHOUSE_DB') || 'default',
          username: configService.get<string>('CLICKHOUSE_USER') || 'default',
          password: configService.get<string>('CLICKHOUSE_PASSWORD') || '',
          // Optional: Adjust for performance
          max_open_connections: 10,
          compression: { response: true, request: true },
          clickhouse_settings: {
            allow_experimental_json_type: 1
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ClickHouseService, ClickHouseSchemaService],
})
export class ClickHouseModule {}