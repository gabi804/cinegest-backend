import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //  Habilitar CORS (permite llamadas desde tu frontend)
  app.enableCors({
    origin: 'http://localhost:5173', // dominio del frontend (Vite)
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`Nest application listening on: http://localhost:${port}`);
}
bootstrap();
