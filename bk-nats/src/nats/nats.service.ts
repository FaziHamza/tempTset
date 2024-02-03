// nats.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { Codec, Msg, NatsConnection, NatsError, Payload, PublishOptions, StringCodec } from 'nats';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';

@Injectable()
export class NatsService {
  private readonly sc: Codec<string>;

  constructor(@Inject('NATS_CONNECTION') private readonly nc: NatsConnection, private readonly subjecthandlerservice: SubjectHandlerService) {
    this.sc = StringCodec(); // Instantiate StringCodec

  }
  public async  publishMessage(subject: string, message: string, options?: PublishOptions) {
    const encodedPayload = this.sc.encode(JSON.stringify(message));
    this.nc.publish(subject, encodedPayload, options);
  }

  public subscribeToMessage(subject: string, callback: (data: any) => void) {
    this.nc.subscribe(subject, {
      callback: (err: NatsError, msg: Msg) => {
        const logMessage = `[${this.subjecthandlerservice.getFormattedTime()}] Subscribe to subject: ${subject}`;
        Logger.log(logMessage)
        const parsedPayload: Payload = JSON.parse(this.sc.decode(msg.data));
        const natsContext: any = msg.subject;
        const clientId = this.extractRandomIdFromSubject(natsContext);
        console.log("Client", clientId)
        callback({
          clientId,
          parsedPayload,
        });
      }
    });
  }
  public async publishstandardloggerMessage( message: string,RequestId :string) {
    const logMessage = `[${this.subjecthandlerservice.getFormattedTime()}] ||[RequestId:${RequestId}] || [${message}]`;
    Logger.log(logMessage)
    const encodedPayload = this.sc.encode(JSON.stringify(logMessage));
    this.nc.publish(`app.logger.standard.${RequestId}`, encodedPayload);
  }
  public async publishdetailedloggerMessage( message: string,RequestId :string) {
    const logMessage = `[${this.subjecthandlerservice.getFormattedTime()}] ||[RequestId:${RequestId}] || [${message}]`;
    Logger.log(logMessage)
    const encodedPayload = this.sc.encode(JSON.stringify(logMessage));
    this.nc.publish(`app.logger.detailed.${RequestId}`, encodedPayload);
  }
  public extractRandomIdFromSubject(subject: string): string | null {
    // Assuming the RandomId is the part after the dot
    const dotIndex = subject.lastIndexOf('.');
    if (dotIndex !== -1) {
      return subject.substring(dotIndex + 1);
    }
    return null;
  }
}