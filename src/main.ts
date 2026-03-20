import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

function resolveListenPort(config: ConfigService): number {
  // Railway injects PORT; Docker/local may use APP_PORT (see Dockerfile)
  const raw =
    config.get<string>('PORT') ||
    config.get<string>('APP_PORT') ||
    '3000';
  const port = Number.parseInt(raw, 10);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid listen port: ${raw}`);
  }
  return port;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const clientOrigin = config.get<string>('CLIENT_ORIGIN');
  app.enableCors({
    origin: clientOrigin
      ? clientOrigin
          .split(',')
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
      : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(resolveListenPort(config));
}

void bootstrap();
