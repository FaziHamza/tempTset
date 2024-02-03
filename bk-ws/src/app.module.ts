import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { WsJwtGuard } from './authverifier/ws-jwt.guard';
import { NatsModule } from './nats/nats.module';
import { GatewayService } from './websocketgateway/gateway.service';
import { NatsService } from './nats/nats.service';

@Module({
  imports: [NatsModule],
  controllers: [AppController],
  providers: [AppService,GatewayService,NatsService,{
    provide:APP_GUARD,
    useClass:WsJwtGuard
  }, ],
})
export class AppModule {}
