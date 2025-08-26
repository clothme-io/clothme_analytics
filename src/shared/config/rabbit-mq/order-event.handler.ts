// src/shared/messaging/handlers/order-event.handler.ts
import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { OrderCreatedEvent } from './message-publisher.service';

@Injectable()
export class OrderEventHandler {
  @RabbitSubscribe({
    exchange: 'clothme.events',
    routingKey: 'order.created',
    queue: 'order.events',
  })
  handleOrderCreated(event: OrderCreatedEvent) {
    console.log('Processing order created event:', event);
    
    // Add your business logic here:
    // - Update inventory
    // - Send order confirmation email
    // - Create shipping label
    // - Notify vendor
    // - Update analytics
    return;
  }

  @RabbitSubscribe({
    exchange: 'clothme.events',
    routingKey: 'order.updated',
    queue: 'order.events',
  })
  handleOrderUpdated(event: any) {
    console.log('Processing order updated event:', event);
    // Handle order update logic
    return;
  }
}