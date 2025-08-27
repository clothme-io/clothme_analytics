import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from './shared/config/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientLogModule } from './api/client/client-log.module';
import { ClickHouseModule } from './shared/config/click-house/clickhouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        console.log('BullMQ using Redis URL:', redisUrl);
        return {
          connection: {
            host: new URL(redisUrl).hostname,
            port: parseInt(new URL(redisUrl).port),
            password: new URL(redisUrl).password,
            username: new URL(redisUrl).username || 'default',
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Use the same Redis URL directly
        const redisUrl = configService.get<string>('REDIS_URL');
        console.log('CacheModule using Redis URL:', redisUrl);
        
        // Use the RedisConfigService's client instead of creating a new one
        return {
          store: undefined, // Don't use Redis store for now to avoid connection issues
          ttl: 60 * 60 * 24 * 1, // 1 day cache TTL
        };
      },
    }),
    ClientLogModule,
    ClickHouseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
