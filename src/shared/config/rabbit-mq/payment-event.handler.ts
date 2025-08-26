// src/shared/messaging/handlers/payment-event.handler.ts
import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PaymentProcessedEvent } from './message-publisher.service';

@Injectable()
export class PaymentEventHandler {
  @RabbitSubscribe({
    exchange: 'clothme.events',
    routingKey: 'payment.processed',
    queue: 'payment.events',
  })
  handlePaymentProcessed(event: PaymentProcessedEvent) {
    console.log('Processing payment processed event:', event);
    
    // Add your business logic here:
    // - Update order status
    // - Send payment confirmation
    // - Update accounting records
    // - Trigger fulfillment process
  }
}