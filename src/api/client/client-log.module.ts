import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AddClientLogController } from './controller/add-client.controller';
import { AddClientLogRedisService } from './service/redis/add-client-log-redis.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'add-client-log',
        }),
    ],
    controllers: [
        AddClientLogController,
    ],
    providers: [
        AddClientLogRedisService,
    ],
    exports: [
        AddClientLogRedisService,
    ],
})
export class ClientLogModule {}
