// src/clickhouse/clickhouse.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@clickhouse/client';
import { ClickHouseService } from './clickhouse.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ClickHouseService,
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
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ClickHouseService],
})
export class ClickHouseModule {}