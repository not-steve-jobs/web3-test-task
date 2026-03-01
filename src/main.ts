import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — enforces class-validator decorators on all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,       // auto-transform query params to declared types
    }),
  );

  // Swagger — available at /api
  const config = new DocumentBuilder()
    .setTitle('Wallet Monitor API')
    .setDescription('Blockchain wallet monitoring service')
    .setVersion('1.0')
    .addTag('wallet')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\nAPI running at: http://localhost:${port}`);
  console.log(`Swagger docs:  http://localhost:${port}/api\n`);
}

bootstrap();
