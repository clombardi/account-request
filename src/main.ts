import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GeneralExceptionFilter, HttpExceptionFilter } from './errors/generalExceptionFilters';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GeneralExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter({ includeHostInResponse: true }));
  // app.useGlobalFilters(new NastyCountryExceptionFilter());
  await app.listen(3000);
}
bootstrap();
