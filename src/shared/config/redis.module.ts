import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigService } from './redis.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisConfigService],
  exports: [RedisConfigService],
})
export class RedisModule {}
