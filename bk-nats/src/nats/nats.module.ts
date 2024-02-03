
import { Module } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Codec } from 'nats';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from './nats.service';
import { NAT_CONNECT } from 'src/shared/config/global-db-config';

@Module({
  imports:[],
  providers: [
    {
      provide: 'NATS_CONNECTION',
      useFactory: async () => {
        return await connect({          
        // reconnectTimeWait: 10 * 1000, // 10s
        servers: [`${NAT_CONNECT.url}`],
        token:`${NAT_CONNECT.token}`
      });
        
      },
    },
    SubjectHandlerService
  ],
  exports: ['NATS_CONNECTION'],
})
export class NatsModule {}
