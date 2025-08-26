import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { RedisConfigService } from './shared/config/redis.config';
import { RedisModule } from './shared/config/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ClientLogModule } from './api/client/client-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    BullModule.forRootAsync({
      useFactory: (redisConfigService: RedisConfigService) => ({
        connection: redisConfigService.createRedisClient(),
      }),
      inject: [RedisConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_CACHE_HOST'),
            port: configService.get<number>('REDIS_CACHE_PORT'),
          },
          url: configService.get<string>('REDIS_CACHE_URL'),
          password: configService.get<string>('REDIS_CACHE_PASSWORD'),
        });
        return {
          store: store as any,
          ttl: 60 * 60 * 24 * 1,
        };
      },
    }),
    ClientLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
