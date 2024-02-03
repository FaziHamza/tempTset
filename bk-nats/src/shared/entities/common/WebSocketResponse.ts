export class WebSocketResponse<T> {
    isSuccess: boolean;
    message: string;
    requestId:string;
    responsetype:string;
    apidata?: T;
    
    constructor(success: boolean, msg: string,requestId:string,responsetype:string, apidata?: T) {
        this.isSuccess = success;
        this.message = msg;
        this.apidata = apidata;
        this.requestId=requestId;
        this.responsetype=responsetype;
    }
}
