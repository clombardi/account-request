import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './errors/AllExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionFilter());
  // app.useGlobalFilters(new NastyCountryExceptionFilter());
  await app.listen(3000);
}
bootstrap();
