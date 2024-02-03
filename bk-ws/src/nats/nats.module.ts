
import { Module } from '@nestjs/common';
import { connect } from 'nats';
import { NAT_CONNECT } from 'src/global-db-config';

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
  ],
  exports: ['NATS_CONNECTION'],
})
export class NatsModule {}
