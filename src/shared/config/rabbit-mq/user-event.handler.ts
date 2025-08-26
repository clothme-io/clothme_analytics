// src/shared/messaging/handlers/user-event.handler.ts
import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { UserCreatedEvent } from './message-publisher.service';

@Injectable()
export class UserEventHandler {
  @RabbitSubscribe({
    exchange: 'clothme.events',
    routingKey: 'user.created',
    queue: 'user.events',
  })
  handleUserCreated(event: UserCreatedEvent) {
    console.log('Processing user created event:', event);
    
    // Add your business logic here
    // For example:
    // - Send welcome email
    // - Create user profile
    // - Initialize user preferences
    // - Log analytics event
  }

  @RabbitSubscribe({
    exchange: 'clothme.events',
    routingKey: 'user.updated',
    queue: 'user.events',
  })
  handleUserUpdated(event: any) {
    console.log('Processing user updated event:', event);
    // Handle user update logic
    return;
  }
}