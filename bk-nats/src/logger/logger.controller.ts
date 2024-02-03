import { Body, Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { Codec, NatsConnection, StringCodec } from 'nats';
import { NatsService } from 'src/nats/nats.service';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { LoggerService } from './logger.service';
import * as dotenv from 'dotenv';
dotenv.config();
@Controller()
export class LoggerController {

  constructor(private readonly natservice: NatsService, private readonly subjecthandlerservice: SubjectHandlerService, private readonly loggerservice: LoggerService) {

  }

  @EventPattern('app.logger.standard.*')
  async standardlogger(@Body() data: string, @Ctx() context: NatsContext): Promise<void> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(data)
      if (`${process.env.STANDARDLOG}`) {
        console.log("Standard")
        await this.loggerservice.log(parsedData)
      }
    } catch (error) {

    }
  }
  @EventPattern('app.logger.detailed.*')
  async detailedlogger(@Body() data: string, @Ctx() context: NatsContext): Promise<void> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(data)
      if (`${process.env.DETAILEDLOG}`) {
        console.log("Detailed")
        await this.loggerservice.log(parsedData)
      }
    } catch (error) {

    }
  }
}
