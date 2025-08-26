import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  public createRedisClient(): Redis {

    const redisUrlFromEnv = this.configService.get<string>('REDIS_URL');

    const options = {
      maxRetriesPerRequest: null,
    };

    const redis = new Redis(redisUrlFromEnv + '?family=0', options);

    redis.on('error', (err) => {
      console.error('Redis client error:', err);
      // Depending on your app's needs, you might want to handle errors more gracefully,
      // e.g., by attempting to reconnect or by flagging the service as unhealthy.
    });

    redis.on('connect', () => {
      console.log('Successfully connected to Redis.');
    });

    redis.on('ready', () => {
      console.log('Redis client is ready to use.');
    });

    redis.on('close', () => {
      console.log('Connection to Redis closed.');
    });

    redis.on('reconnecting', (delay) => {
      console.log(`Redis client reconnecting in ${delay}ms...`);
    });

    redis.on('end', () => {
      console.log('Redis client connection has ended. No more reconnections will be attempted.');
    });
    
    return redis;
  }
}
