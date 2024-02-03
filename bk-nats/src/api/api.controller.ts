import { Body, Controller, Get, Param, Post, Request, Put, Delete, Headers, Inject, Logger } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiResponse } from 'src/shared/entities/common/apiResponse';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from 'src/nats/nats.service';
import { CommonService } from 'src/shared/services/common/common.service';
import { WebSocketResponse } from 'src/shared/entities/common/WebSocketResponse';
@Controller()
export class ApiController {
  constructor(private readonly natservice: NatsService, private readonly apiService: ApiService,
    private readonly subjecthandlerservice: SubjectHandlerService, private readonly commonService: CommonService
  ) {

  }


  @EventPattern('app.exe.API.modelType')
  async GetAll(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<any> {
    try {
      console.log(requestdata)
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      console.log(parsedData)
      await this.natservice.publishstandardloggerMessage(`app.exe.API.modelType [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      console.log(table)
      if (table) {
        var result = await this.apiService.getAll(table.value, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId, requestdata.User,parsedData.metaInfo.RequestId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.modelTypebyid')
  async getById(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata)
      await this.natservice.publishstandardloggerMessage(`app.exe.API.modelTypebyid [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.getById(table.value, parsedData.metaInfo.id, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId, requestdata.User);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.createModelType')
  async create(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata)
      const keys = Object.keys(parsedData);
      const tablename = keys[0];
      await this.natservice.publishstandardloggerMessage(`app.exe.API.createModelType [${tablename}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === tablename.toLowerCase());
      if (table) {
        var body = { [table.value]: parsedData[tablename] };
        var result = await this.apiService.create(body, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${tablename}]`, parsedData.metaInfo.RequestId)

    } catch (error) {
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.updateModelTypeId')
  async update(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      const keys = Object.keys(parsedData);
      const modelType = keys[0];
      await this.natservice.publishstandardloggerMessage(`app.exe.API.updateModelTypeId [${modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === modelType.toLowerCase());
      if (table) {
        var body = { [table.value]: parsedData[modelType] };
        var result = await this.apiService.update(table.value, parsedData.metaInfo.id, body, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId, parsedData.metaInfo.Origin);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    } catch (error) {
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.deleteModelTypeId')
  async delete(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      const Log = `app.exe.API.deleteModelTypeId  ${parsedData.metaInfo.RequestId}`;
      await this.natservice.publishstandardloggerMessage(`app.exe.API.deleteModelTypeId [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.delete(table.value, parsedData.metaInfo.id, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.actionRuleCrud')
  async actionRuleCRUD(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<ApiResponse<any>> {
    const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
    const { modelType, actiontag, RequestId, ...restbody } = parsedData;
    await this.natservice.publishstandardloggerMessage(`app.exe.API.actionRuleCrud [${parsedData.metaInfo.modelType}]`, parsedData.metaInfo.RequestId)
    const table = this.commonService.tableList.find(entry => entry.key === parsedData.metaInfo.modelType.toLowerCase());
    if (table) {
      var result = await this.apiService.actionRuleCRUD(parsedData.dataobject, requestdata.ApplicationId, parsedData.metaInfo.screenbuilderid, table.value);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
    } else {
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
    }
    await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    return null;
  }

  // @Post('/deleteAction/:modelType/:screenBuilderId')
  @EventPattern('app.exe.API.manageActionCrud')
  async actionCRUD(@Body() requestdata: ModelRequest): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.manageActionCrud [${parsedData.metaInfo.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.metaInfo.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.actionCRUD(parsedData.dataobject, requestdata.ApplicationId, parsedData.metaInfo.screenbuilderid, table.value);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }

  }
  @EventPattern('app.exe.API.policyMappingCrud')
  async PolicyMapping(@Body() requestdata: ModelRequest): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.modelTypebyid [${parsedData.metaInfo.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.metaInfo.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.policyMappingCRUD(parsedData.dataobject, requestdata.ApplicationId, table.value, requestdata.PolicyId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.emailtemplates')
  async emailTemplateCRUD(@Body() requestdata: ModelRequest): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.emailtemplates [${parsedData.metaInfo.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.metaInfo.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.emailTemplateCRUD(parsedData.dataobject, requestdata.ApplicationId, table.value);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.domainModelTypeById')
  async getByDomain(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata)
      await this.natservice.publishstandardloggerMessage(`app.exe.API.domainModelTypeById [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result: any = await this.apiService.getByDomain(table.value, parsedData.metaInfo.id, requestdata.UserId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      Logger.log("Result Error Data", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);

    }
  }

  // @Get('/getmenu/:modelType/:id')
  @EventPattern('app.exe.API.getBuildermenu')
  async getBuilderMenu(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<ApiResponse<any>> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata)
      await this.natservice.publishstandardloggerMessage(`app.exe.API.domainModelTypeById [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result: any = await this.apiService.getBuilderMenu(table.value, parsedData.metaInfo.id, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.actiontag, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      return null;
    } catch (error) {
      Logger.log("Result Error Data", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);

    }
  }
  @EventPattern('app.exe.API.getCloneApplication')
  async cloneApplicationData(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.getCloneApplication [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.cloneApplicationData(table.value);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Post('/defaultApplication/postData/insertData')
  @EventPattern('app.exe.API.postDefaultApplication')
  async defaultApplication(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.PostDefaultApplication [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.defaultApplication(parsedData);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res. [${parsedData.modelType}]`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.insertNewTable')
  async insertNewTable(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      console.log("Model", parsedData)
      const Log = `app.exe.API.insertNewTable ${parsedData.metaInfo.RequestId}`;
      await this.natservice.publishstandardloggerMessage(`app.exe.API.insertNewTable`, parsedData.metaInfo.RequestId)
      var result = await this.apiService.insertNewTable(parsedData, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.createTable')
  async createTable(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.createTable `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.createTable(parsedData, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }

  @EventPattern('app.exe.API.dropColumn')
  async dropColumns(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.dropColumn `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.dropColumns(parsedData, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }

  @EventPattern('app.exe.API.dropTable')
  async dropTable(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.dropTable `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.dropTable(parsedData.tableName, requestdata.OrganizationId, requestdata.ApplicationId, requestdata.UserId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }

  @EventPattern('app.exe.API.sampleScreen')
  async sampleScreen(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext): Promise<any> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.sampleScreen `, parsedData.metaInfo.RequestId)
      const table = this.commonService.tableList.find(entry => entry.key === parsedData.modelType.toLowerCase());
      if (table) {
        var result = await this.apiService.sampleScreen(table.value);
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, result);
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      } else {
        const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.modelType, new ApiResponse(false, 'Key not found'));
        await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      }
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Get('/applications/sampleScreen/:modelType')
  // async sampleScreen(@Param('modelType') modelType: string) {
  //   // const table = this.commonService.tableList.find(entry => entry.key === modelType.toLowerCase());
  //   // if (table) {
  //   //   modelType = table.value;
  //   // } else {
  //   //   return new ApiResponse(false, 'Key not found');
  //   // }
  //   return this.apiService.sampleScreen(modelType);
  // }
  @EventPattern('app.exe.API.checkUserScreen')
  async checkUserScreen(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.checkUserScreen `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.checkUserScreen(parsedData.metaInfo.id, requestdata.ApplicationId, requestdata.UserId, requestdata.PolicyId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.getUserPolicyMenu')
  async getUserPolicyMenu(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.getUserPolicyMenu `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.getUserPolicyMenu(requestdata.ApplicationId, requestdata.PolicyId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @EventPattern('app.exe.API.getUserCommentsByApp')
  async getuserCommentsByApp(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.API.getUserCommentsByApp `, parsedData.metaInfo.RequestId)
      var result = await this.apiService.getuserCommentsByApp(parsedData.modelType, parsedData.metaInfo.ScreenIdId, parsedData.metaInfo.Type, requestdata.ApplicationId);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId)
    } catch (error) {
      console.log("error", error.message)
      this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  @Get('/auth/pageAuth/testing/111')
  async testing(@Headers('ApplicationId') appId: string, @Headers('userId') userId: string): Promise<ApiResponse<any>> {
    return await this.apiService.testing(appId);
  }

}