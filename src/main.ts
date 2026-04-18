import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix tất cả route với /api
  app.setGlobalPrefix('api');

  // Tự động validate DTO, loại bỏ field không khai báo
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // strip fields không có trong DTO
    forbidNonWhitelisted: true,
    transform: true,       // auto-cast string → number, string → boolean
  }));

  // Tự động loại bỏ field có @Exclude() (password_hash, v.v.)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  // CORS cho Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true, // cho phép gửi cookie
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on port ${process.env.PORT || 3000}`);
}
bootstrap();