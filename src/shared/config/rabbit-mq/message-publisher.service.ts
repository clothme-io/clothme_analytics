// src/shared/messaging/services/message-publisher.service.ts
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface BaseEvent {
  eventId: string;
  timestamp: Date;
  userId?: string;
  accountId?: string;
}

export interface UserCreatedEvent extends BaseEvent {
  type: 'user.created';
  data: {
    userId: string;
    email: string;
    accountId: string;
  };
}

export interface OrderCreatedEvent extends BaseEvent {
  type: 'order.created';
  data: {
    orderId: string;
    userId: string;
    accountId: string;
    total: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface PaymentProcessedEvent extends BaseEvent {
  type: 'payment.processed';
  data: {
    paymentId: string;
    orderId: string;
    amount: number;
    status: 'success' | 'failed';
  };
}

export type ClothMeEvent = UserCreatedEvent | OrderCreatedEvent | PaymentProcessedEvent;

@Injectable()
export class MessagePublisherService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishEvent(event: ClothMeEvent): Promise<void> {
    const routingKey = event.type;
    
    await this.amqpConnection.publish(
      'clothme.events',
      routingKey,
      {
        ...event,
        publishedAt: new Date(),
      },
      {
        persistent: true,
        messageId: event.eventId,
        timestamp: Date.now(),
      }
    );
  }

  async sendNotification(
    type: 'email' | 'sms' | 'push',
    recipient: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.amqpConnection.publish(
      'clothme.notifications',
      type,
      {
        recipient,
        subject,
        content,
        metadata,
        timestamp: new Date(),
      },
      {
        persistent: true,
      }
    );
  }
}