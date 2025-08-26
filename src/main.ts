import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('v1');

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;

  // Set up validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Clothme API')
    .setDescription('The Clothme API description')
    .setVersion('1.0')
    .addTag('clothme')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api', app, document);

  // Start the application - bind to all interfaces
  await app.listen(port, '0.0.0.0');
  logger.log(`Application server is running on: ${await app.getUrl()}`);
}

// Start the application
void bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Error during bootstrap: ${errorMessage}`);
  process.exit(1);
});
