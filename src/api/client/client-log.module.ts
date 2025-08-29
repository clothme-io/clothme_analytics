import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AddClientLogController } from './controller/add-client.controller';
import { LogEventController } from './controller/log-event.controller';
import { GetEventLogsController } from './controller/get-event-logs.controller';
import { AddClientLogRedisService } from './service/redis/add-client-log-redis.service';
import { GetEventLogsRedisService } from './service/redis/get-event-logs-redis.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        BullModule.registerQueue({
            name: 'add-client-log',
        }),
    ],
    controllers: [
        AddClientLogController,
        LogEventController,
        GetEventLogsController,
    ],
    providers: [
        AddClientLogRedisService,
        GetEventLogsRedisService,
    ],
    exports: [
        AddClientLogRedisService,
        GetEventLogsRedisService,
    ],
})
export class ClientLogModule {}
