import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { SECRETS } from '../global-db-config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    return WsJwtGuard.ValidateToken(client);
  }

  static ValidateToken(client: Socket): boolean {
    const authorizationHeader = client.handshake.headers.authorization;
    if (!authorizationHeader) {
      WsJwtGuard.sendErrorMessage(client, 'Authorization header not found','401');
      return false;
    }

    const tokenParts = authorizationHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      WsJwtGuard.sendErrorMessage(client, 'Invalid authorization header format. It should be in the format: Bearer <token>','401');
      return false;
    }
    const token = tokenParts[1];

    try {
      // Instead of
      console.log(token)
      const decoded = verify(token, `${SECRETS.secretKey}`);
      console.log(decoded)
     // const decoded = verify(token, process.env.JWT_SECRET as string);

      // Check token expiration
      // const currentTimestamp = Math.floor(Date.now() / 1000);
      // if (decoded.exp && decoded.exp < currentTimestamp) {
      //   throw new UnauthorizedException('Token has expired');
      // }

      return true;
    } catch (error) {
      WsJwtGuard.sendErrorMessage(client, 'Invalid token','401');
    return false;
      }
  }
  private static sendErrorMessage(client: Socket, message: string,status :string): void {
    // client.use((socket, next) => {
    //   const err :any= new Error("not authorized");
    //   console.log(err)
    //   err.data = { content: "Please retry later" }; // additional details
    //   next(err);
    // });
    console.log(message)
    client.emit('ResponseMessage', { message ,status});
  }
}
