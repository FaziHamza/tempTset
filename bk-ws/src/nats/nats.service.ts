// nats.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { Codec, Msg, NatsConnection, NatsError, Payload, PublishOptions, StringCodec } from 'nats';

@Injectable()
export class NatsService {
  private readonly sc: Codec<string>;

  constructor(@Inject('NATS_CONNECTION') private readonly nc: NatsConnection) {
    this.sc = StringCodec(); // Instantiate StringCodec

  }
  public publishMessage(subject: string, message: string, options?: PublishOptions, LogMessage?: string) {
    const encodedPayload = this.sc.encode(JSON.stringify(message));
    this.nc.publish(subject, encodedPayload, options);
  }

  public subscribeToMessage(subject: string, callback: (data: any, clientId: any) => void) {
    this.nc.subscribe(subject, {
      callback: (err: NatsError, msg: Msg) => {
        const parseddata: any = JSON.parse(this.sc.decode(msg.data));
        const natsContext: any = msg.subject;
        const clientId = this.extractRandomIdFromSubject(natsContext);
        callback({
          parseddata,
        },
          clientId);

      }
    });
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