import { Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';

export type SocketIoMiddleWare={
    (client:Socket,next:(err?:Error)=>void)
}
export const SocketAuthMiddleware  =():SocketIoMiddleWare=>{
return(client,next)=>{
    try {
    WsJwtGuard.ValidateToken(client);
    next();
    }
    catch(error){
        next(error);
    }
}
}