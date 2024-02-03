import { Body, Controller, Get, Param, Post, Put, Delete, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/shared/entities/common/apiResponse';
import { RecaptchaService } from './recaptcha.service';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from 'src/nats/nats.service';
import { WebSocketResponse } from 'src/shared/entities/common/WebSocketResponse';
@Controller()
export class AuthController {
  /**
   *
   */
  constructor(private readonly authService: AuthService, private recaptchaService: RecaptchaService
    , private subjecthandlerservice: SubjectHandlerService, private natservice: NatsService) {

  }

  @EventPattern('app.Auth.Register')
  async createUser(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext
  ): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.Register`, parsedData.metaInfo.RequestId)
      if (!parsedData.AuthRegister.responsekey || parsedData.AuthRegister.responsekey.trim() === '') {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthRegister', new ApiResponse(false, 'No reCAPTCHA found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
        await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
        return null;
      }

      const isRecaptchaValid = await this.recaptchaService.validateRecaptcha(parsedData.AuthRegister.responsekey, parsedData.domain);
      if (!isRecaptchaValid) {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthRegister', new ApiResponse(false, 'Invalid reCAPTCHA token'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
        await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
        return null;
      }
      const newresult = await this.authService.registerUser(parsedData.AuthRegister, requestdata.Origin);
      const result: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthRegister', newresult);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, result, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)

    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);

    }
  }

  @EventPattern('app.Auth.ExternalSignup')
  async createUserExternalLogin(@Body() requestdata: ModelRequest
  ): Promise<any> {
    try {
      console.log("body " + JSON.stringify(requestdata))
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.ExternalSignup`, parsedData.metaInfo.RequestId)
      const result = await this.authService.createUserExternal(parsedData);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'ExternalSignup', result);
       this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)

    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);

    }
  }
  @EventPattern('app.Auth.Login')
  async login(@Body() requestdata: ModelRequest) {
    // console.dir(req)
    try {
      // console.log("body " + JSON.stringify(requestdata))
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.Login`, parsedData.metaInfo.RequestId)
      if (!parsedData.AuthLogin.responsekey || parsedData.AuthLogin.responsekey.trim() === '') {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthLogin', new ApiResponse(false, 'No reCAPTCHA found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
        return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
      }

      //   const isRecaptchaValid = await this.recaptchaService.validateRecaptcha(req.responsekey, req.domain);
      //   if (!isRecaptchaValid) {
      //     return { success: false, message: 'Invalid reCAPTCHA token' };
      //   }
      const result = await this.authService.login(parsedData.AuthLogin);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthLogin', result);
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)

    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.Auth.GetAppDetais')
  async GetAll(@Body() requestdata: ModelRequest): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.GetAppDetais`, parsedData.metaInfo.RequestId)
      const newresult: any = await this.authService.getAppDetails(parsedData.metaInfo.id);
      const result: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthGetAppDetais', newresult);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, result, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)

    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.Auth.GetByDomain')
  async getByDomain(@Body() requestdata: ModelRequest): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.GetByDomain`, parsedData.metaInfo.RequestId)
      const result: any = await this.authService.getByDomain(parsedData.metaInfo.type, parsedData.metaInfo.id);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'GetByDomain', result);
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.Auth.ResetPassword')
  async resetPassword(@Body() requestdata: ModelRequest) {
    // console.dir(req)
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.ResetPassword`, parsedData.metaInfo.RequestId)
      const result: any = await this.authService.resetPassword(parsedData, requestdata.Origin, requestdata.ApplicationId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'ResetPassword', result);
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.Auth.Forget')
  async create(@Body() requestdata: ModelRequest) {
    // console.dir(req)
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.Auth.Forget`, parsedData.metaInfo.RequestId)
      if (!parsedData.responsekey || parsedData.responsekey.trim() === '') {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthForget', new ApiResponse(false, 'No reCAPTCHA found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
        return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
      }
      const isRecaptchaValid = await this.recaptchaService.validateRecaptcha(parsedData.responsekey, parsedData.domain);
      if (!isRecaptchaValid) {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthForget', new ApiResponse(false, 'Invalid reCAPTCHA token'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
        return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
      }
      const result: any = await this.authService.create(parsedData, requestdata.Origin, requestdata.ApplicationId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, 'AuthForget', result);
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);

    } catch (error) {
      // Handle the error here, you can log it or return a specific error response
      return await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
}
