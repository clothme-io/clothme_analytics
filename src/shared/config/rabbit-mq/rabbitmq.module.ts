// src/shared/config/rabbit-mq/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQConfigService } from './rabbitmq.config';
import { MessagePublisherService } from './message-publisher.service';
import { UserEventHandler } from './user-event.handler';
import { OrderEventHandler } from './order-event.handler';
import { PaymentEventHandler } from './payment-event.handler';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('RABBITMQ_URL');
        
        if (!uri) {
          console.warn('RABBITMQ_URL not set, RabbitMQ will be disabled');
          return null;
        }

        return {
          uri,
          connectionInitOptions: { 
            wait: false,
            timeout: 10000,
            frameMax: 8192,
            heartbeat: 60,
          },
          exchanges: [
            {
              name: 'clothme.events',
              type: 'topic',
              options: {
                durable: true,
              },
            },
            {
              name: 'clothme.notifications',
              type: 'direct',
              options: {
                durable: true,
              },
            },
          ],
          queues: [
            {
              name: 'user.events',
              exchange: 'clothme.events',
              routingKey: 'user.*',
              options: {
                durable: true,
              },
            },
            {
              name: 'order.events',
              exchange: 'clothme.events',
              routingKey: 'order.*',
              options: {
                durable: true,
              },
            },
            {
              name: 'payment.events',
              exchange: 'clothme.events',
              routingKey: 'payment.*',
              options: {
                durable: true,
              },
            },
            {
              name: 'email.notifications',
              exchange: 'clothme.notifications',
              routingKey: 'email',
              options: {
                durable: true,
              },
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    RabbitMQConfigService,
    MessagePublisherService,
    UserEventHandler,
    OrderEventHandler,
    PaymentEventHandler,
  ],
  exports: [
    MessagePublisherService,
    RabbitMQModule,
    RabbitMQConfigService,
    UserEventHandler,
    OrderEventHandler,
    PaymentEventHandler,
  ],
})
export class ClothMERabbitMQModule {}