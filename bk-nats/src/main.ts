import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { NAT_CONNECT } from './shared/config/global-db-config';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: [`${NAT_CONNECT.url}`],
      token:`${NAT_CONNECT.token}`,
      queue:'NatsQueue'

    },
  });
  await app.listen();
}
bootstrap()
