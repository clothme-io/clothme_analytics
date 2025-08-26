// src/shared/config/rabbitmq.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQConfigService {
  constructor(private configService: ConfigService) {}

  createRabbitMQConfig(): RabbitMQConfig {
    const uri = this.configService.get<string>('RABBITMQ_URL');
    
    if (!uri) {
      throw new Error('RABBITMQ_URL environment variable is required');
    }

    return {
      uri,
      connectionInitOptions: { wait: false },
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
  }
}