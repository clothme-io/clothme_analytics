// src/cli/cli.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickHouseModule } from '../shared/config/click-house/clickhouse.module';
import { InitClickHouseSchemaCommand } from './commands/init-clickhouse-schema.command';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClickHouseModule,
  ],
  providers: [
    InitClickHouseSchemaCommand,
  ],
})
export class CliModule {}
