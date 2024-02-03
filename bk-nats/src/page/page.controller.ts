import { ApiResponse } from 'src/shared/entities/common/apiResponse';
import { PageService } from './page.service';
import { Body, Controller, Get, Param, Post, Query, Headers, UseInterceptors, UploadedFile, Req, Request } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { WebSocketResponse } from 'src/shared/entities/common/WebSocketResponse';
import { NatsService } from 'src/nats/nats.service';
@Controller()
export class PageController {
  constructor(private readonly pageService: PageService, private readonly subjecthandlerservice: SubjectHandlerService, private readonly natservice: NatsService) { }

  // @Post('')
  // async create(@Body() data: any, @Req() request: any, @Headers('ApplicationId') appId: string, @Headers('screenBuildId') screenBuildId: string, @Headers('OrganizationId') orgId: string, @Headers('User') user: string,) {
  //     return this.pageService.saveDb(data, screenBuildId, appId, orgId, request, user);
  // }
  @EventPattern('app.exe.Page.create')
  async create(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.create`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.saveDb(parsedData, parsedData.metaInfo.screenBuildId, requestdata.ApplicationId, requestdata.OrganizationId, parsedData.metaInfo.request, requestdata.User);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Post('/execute-actions/:screenBuilderId')
  // async executeActions(@Request() req, @Body() data: any, @Headers('ApplicationId') appId: string, @Headers('policyId') policyId: string, @Headers('screenBuildId') screenBuildId: string, @Headers('User') user: string, @Headers('OrganizationId') orgId: string, @Headers('screenId') screenId: string, @Param('screenBuilderId') screenBuilderId: string) {
  //     return this.pageService.processActionRules(req, appId, orgId, user, policyId, screenId, screenBuildId, screenBuilderId, data);
  // }
  @EventPattern('app.exe.Page.excecuteaction')
  async executeActions(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.excecuteaction`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.processActionRules(parsedData.metaInfo.request, requestdata.ApplicationId, requestdata.OrganizationId, requestdata.User, parsedData.metaInfo.policyId, parsedData.metaInfo.screenId, parsedData.metaInfo.screenBuildId, parsedData.metaInfo.screenBuilderId, parsedData);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);

    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Post('/execute-rules/:ruleId')
  // async executeRules(@Request() req, @Body() data: any, @Headers('ApplicationId') appId: string, @Req() request: any, @Headers('screenBuildId') screenBuildId: string
  //, @Headers('User') user: string, @Headers('policyId') policyId: string, @Headers('OrganizationId') orgId: string, 
  //@Headers('screenId') screenId: string, @Param('ruleId') ruleId: string) {
  //     return this.pageService.executeRules(req, appId, orgId, user, request, policyId, screenId, screenBuildId, ruleId, data);
  // }
  @EventPattern('app.exe.Page.executerules')
  async executeRules(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.executerules`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.executeRules(parsedData.metaInfo.req, requestdata.ApplicationId, requestdata.OrganizationId, requestdata.User,
        parsedData.metaInfo.request, requestdata.PolicyId, parsedData.metaInfo.screenId, parsedData.metaInfo.screenBuildId,
        parsedData.metaInfo.ruleId, parsedData);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Post('/executeDelete-rules/:ruleId')
  // async executeDeleteRules(@Request() req, @Body() data: any, @Headers('ApplicationId') appId: string, @Req() request: any, @Headers('screenBuildId') screenBuildId: string, @Headers('User') user: string, @Headers('policyId') policyId: string, @Headers('OrganizationId') orgId: string, @Headers('screenId') screenId: string, @Param('ruleId') ruleId: string) {
  //     return this.pageService.executeDeleteRules(req, appId, orgId, user, request, policyId, screenId, screenBuildId, ruleId, data);
  // }
  @EventPattern('app.exe.Page.executedelete')
  async executeDeleteRules(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.executedelete`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.executeDeleteRules(parsedData.metaInfo.req, requestdata.ApplicationId, requestdata.OrganizationId, requestdata.User, parsedData.metaInfo.request, parsedData.metaInfo.policyId, parsedData.metaInfo.screenId, parsedData.metaInfo.screenBuildId, parsedData.metaInfo.ruleId, parsedData);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Get('/getexecute-rules/:ruleId/:parentId?')
  // async getexecuteRules(@Headers('ApplicationId') appId: string, @Req() request: any,
  //     @Request() req,
  //     @Headers('OrganizationId') orgId: string, @Headers('policyId') policyId: string, @Headers('screenBuildId') screenBuildId: string,
  //     @Headers('User') user: string, @Headers('screenId') screenId: string, @Param('ruleId') ruleId: string, @Param('parentId') parentId: string,
  //     @Query('search') search?: string,
  //     @Query('filters') filters?: string,
  //     @Query('page') page?: number,
  //     @Query('pageSize') pageSize?: number,) {
  //     console.log(`search : ${search}`)
  //     return this.pageService.getexecuteRules(req, appId, orgId, user, request, policyId, screenId, screenBuildId, ruleId, parentId, page, pageSize, search, filters);
  // }
  @EventPattern('app.exe.Page.getexecuterule')
  async getexecuteRules(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.getexecuterule`, parsedData.metaInfo.RequestId)
      const { screenId, request, screenBuildId, ruleId, search, page, pageSize, filters, RequestId, actiontag, req, parentId } = parsedData.metaInfo;
      const { ApplicationId, OrganizationId, User, RandomId, PolicyId } = requestdata;
      var result = await this.pageService.getexecuteRules(req, ApplicationId, OrganizationId, User, request, PolicyId, screenId,
        screenBuildId, ruleId, parentId, page, pageSize, search, filters);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', RequestId, actiontag, result);
      await this.natservice.publishMessage(`app.res.${RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Get('/getAction/:id/:parentId')
  // async getDb(
  //     @Param('id') id: string,
  //     @Headers('User') user: string,
  //     @Param('parentId') parentId: string,
  //     @Query('page') page?: number,
  //     @Query('pageSize') pageSize?: number,
  // ) {
  //     const result = this.pageService.getDb(id, user, parentId, page, pageSize, '');
  //     return result;
  // }
  @EventPattern('app.exe.Page.getaction')
  async getDb(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      console.log("Model", parsedData)
      const Log = `app.exe.Page.getaction ${parsedData.metaInfo.RequestId}`;
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.getaction`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.getDb(parsedData.metaInfo.id, requestdata.User, parsedData.metaInfo.parentId,
        parsedData.metaInfo.page, parsedData.metaInfo.pageSize, '');
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }

  // @Get(':screen')
  // async read(@Param('screen') screen: string,
  //     @Query('page') page?: number,
  //     @Query('pageSize') pageSize?: number, @Headers('ApplicationId') appId?: string): Promise<any> {
  //     return this.pageService.read(screen, page, pageSize, appId);
  // }

  // @Get()
  // async joinTables(
  //     @Query('tables') tables: string,
  //     @Query('relationIds') relationIds: string
  // ): Promise<any> {
  //     const tableNames = tables.split(',');
  //     const relationIdList = relationIds.split(',');

  //     if (tableNames.length !== relationIdList.length) {
  //         throw new Error('The number of tables must match the number of relationIds');
  //     }

  //     try {
  //         let query = this.knex
  //             .select()
  //             .from(tableNames[0]);

  //         for (let i = 1; i < tableNames.length; i++) {
  //             query = query.innerJoin(
  //                 tableNames[i],
  //                 `${tableNames[i - 1]}.${relationIdList[i - 1]}`,
  //                 `${tableNames[i]}.${relationIdList[i]}`
  //             );
  //         }

  //         const result = await query;

  //         return result;
  //     } catch (error) {
  //         console.error('Error occurred during joinTables:', error);
  //         throw new Error('Internal server error');
  //     }
  // }
  // @Post('executeQuery/:actionId?')
  // async executeQuery(@Body() data: any, @Req() request: any, @Headers('ApplicationId') appId: string, @Param('actionId') actionId: string, @Headers('User') user: string): Promise<ApiResponse<any[]>> {
  //     return await this.pageService.executeDeleteQueries(data, appId, request, actionId, user);
  // }
  @EventPattern('app.exe.Page.executequery')
  async executeQuery(@Body() requestdata: ModelRequest, @Ctx() context: NatsContext) {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(requestdata.objectdata);
      await this.natservice.publishstandardloggerMessage(`app.exe.Page.executequery`, parsedData.metaInfo.RequestId)
      var result = await this.pageService.executeDeleteQueries(parsedData, requestdata.ApplicationId, parsedData.metaInfo.request, parsedData.metaInfo.actionId,
        requestdata.User);
      const newresult: any = new WebSocketResponse(true, 'Data Retrieved', parsedData.metaInfo.RequestId, parsedData.metaInfo.actiontag, result);
      await this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, newresult, null);
      return await this.natservice.publishstandardloggerMessage(`app.res.`, parsedData.metaInfo.RequestId);
    } catch (error) {
      console.log("error", error.message)
      await  this.natservice.publishMessage(`app.res.${requestdata.RandomId}`, error.message);
    }
  }
  // @Post('savecsv/:ruleId')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file, @Param('ruleId') ruleId: string, @Headers('ApplicationId') appId: string, @Headers('User') user: string, @Headers('OrganizationId') orgId: string,) {
  //     return this.pageService.uploadExcelFileV2(file, ruleId, appId, orgId, user);
  //     // return this.pageService.uploadExcelFile(file, tableName);
  // }

}
