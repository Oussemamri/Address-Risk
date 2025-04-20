import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const error = errors[0];
        return {
          statusCode: 400,
          message: error.constraints ? Object.values(error.constraints)[0] : 'Validation error',
        };
      },
    }),
  );
  
  // Enable CORS for specific origin
  app.enableCors({
    origin: 'https://address-risk-frontend.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
