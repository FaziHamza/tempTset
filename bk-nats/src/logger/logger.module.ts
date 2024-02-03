
import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { NatsService } from 'src/nats/nats.service';
import { NatsModule } from 'src/nats/nats.module';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { LoggerService } from './logger.service';

@Module({
  imports:[NatsModule],
  controllers: [LoggerController],
  providers: [NatsService,SubjectHandlerService,LoggerService],
})
export class LoggerModule {}