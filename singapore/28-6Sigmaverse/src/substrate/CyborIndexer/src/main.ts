import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const PREFIX = 'api';
  const appOptions = {cors: true};
  const app = await NestFactory.create(ApplicationModule, appOptions);
  app.setGlobalPrefix(PREFIX);

  const options = new DocumentBuilder()
    .setTitle('Sigmaverse')
    .setDescription('The API documentation is based on Swagger and integrates the architectural capabilities of GearJS-Sails, allowing you to easily access data from the Vara network in a familiar way. It also serves as the foundational data layer for the game inspector, commonly known as the game backend in traditional Web2 environments.')
    .setVersion('0.0.1')
    .setBasePath(PREFIX)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(4321);
}
bootstrap();