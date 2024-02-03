import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { NatsContext } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { Codec, NatsConnection, StringCodec, Payload, NatsError, Msg, MsgHdrs, headers } from 'nats';
import { Inject } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators/core';
import { WsJwtGuard } from 'src/authverifier/ws-jwt.guard';
import { Logger } from '@nestjs/common/services/logger.service';
import { Client } from 'socket.io/dist/client';
import { SocketAuthMiddleware } from 'src/authverifier/websocket.middleware';
import { NatsService } from 'src/nats/nats.service';
import { SECRETS } from 'src/global-db-config';
import { verify } from 'jsonwebtoken';


@WebSocketGateway(8080, { cors: { origin: true } })
export class GatewayService implements OnModuleInit, OnGatewayDisconnect, OnGatewayConnection {
  private readonly sc: Codec<string>;

  constructor(private readonly natservice:NatsService) {
    this.sc = StringCodec(); // Instantiate StringCodec
    // this.DataDisplay = this.DataDisplay.bind(this);
  }

  afterInit(client: Socket) {
    //client.use(SocketAuthMiddleware() as any)
    Logger.log('After Init')
  }

  async onModuleInit() {

    // WebSocket server connection handler
    this.server.on('connection', (socket) => {
      console.log("SocketId", socket.id);
      console.log('Connected');
    });
    this.natservice.subscribeToMessage('app.res.*', (data,clientId) => {
      const parseddata:any=data.parseddata;
      console.log('Received message from NATSS:',parseddata);
      this.server.to(clientId).emit('ResponseMessage', {parseddata});
    });
  }



  @WebSocketServer() server: Server;
  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    delete client.id; // Remove the disconnected connection
  }
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('RequestMessage')
  async handleRequestMessage(client: Socket, payload: any): Promise<void> {
    console.log('RequestMessage')
    // Handle the received message
    const header = headers();
    // Append values to headers
    const tokenParts = client.handshake.headers.authorization.split(' ')[1];
    const decoded = verify(tokenParts, `${SECRETS.secretKey}`);
    console.log(decoded);
    header.append('applicationid', `${decoded.userDetail.applicationId}`);
    header.append('organizationid', `${decoded.userDetail.organizationId}`);
    header.append('userid', `${decoded.userDetail.userId}`);
    header.append('user', `${decoded.username}`);
    header.append('Origion', `${client.handshake.headers.origin}`);
    header.append('PolicyId', `${decoded.userDetail.policy.policyid}`);
    const jsonString = { ...payload }; // Include clientId in the payload
    this.natservice.publishMessage(`app.req.${client.id}`,jsonString, { headers: header },`[RequestId:${payload.metaInfo.RequestId}]`);
  }
 

  @SubscribeMessage('AuthMessage')
  async handleGetDataMessage(client: any, payload: any): Promise<void> {
    console.log(`Received AuthMessage from ${client.id}: ${payload}`);
    const header = headers();
    header.append('applicationid', `${client.handshake.headers.applicationid}`);
    header.append('organizationid', `${client.handshake.headers.organizationid}`);
    header.append('userid', `${client.handshake.headers.userid}`);
    header.append('user', `${client.handshake.headers.user}`);
    header.append('Origion', `${client.handshake.headers.origin}`);
    header.append('PolicyId', `${client.handshake.headers.policyid}`);
    const jsonString = { ...payload }; // Include clientId in the payload
    this.natservice.publishMessage(`app.req.${client.id}`,jsonString, { headers: header },`[RequestId:${payload.metaInfo.RequestId}]`);
  }
  private extractUserIdFromSubject(subject: string): string | null {
    // Assuming the user ID is the part after the dot
    const dotIndex = subject.lastIndexOf('.');
    if (dotIndex !== -1) {
      return subject.substring(dotIndex + 1);
    }
    return null;
  }
}
