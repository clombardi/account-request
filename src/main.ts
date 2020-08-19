import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GeneralExceptionFilter, HttpExceptionFilter } from './errors/generalExceptionFilters';
import { LogEndpointInterceptor } from './middleware/general.interceptors';
import { INestApplication } from '@nestjs/common';


function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Example NestJS App')
    .setDescription('Example NestJS application, with several modules')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('apidoc', app, document);  
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GeneralExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter({ includeHostInResponse: true }));
  // app.useGlobalFilters(new NastyCountryExceptionFilter());
  app.useGlobalInterceptors(new LogEndpointInterceptor());

  // Swagger config in a separate function
  setupSwagger(app);

  // done with the config
  await app.listen(3001);
}

bootstrap();
