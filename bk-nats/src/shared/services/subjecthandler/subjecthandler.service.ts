// src/time/time.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class SubjectHandlerService {

  stringifyAndParseObject(objectData: any): any {
    const jsonString = JSON.stringify(objectData);
    const parsedData = JSON.parse(jsonString);
    return parsedData;
  }
  public getFormattedTime(): string {
    const d = new Date();
    let h = this.addZero(d.getHours());
    let m = this.addZero(d.getMinutes());
    let s = this.addZero(d.getSeconds());
    let ms = this.addZero(d.getMilliseconds());
    return `${h}:${m}:${s}:${ms}`;
  }

  private addZero(i: number): string {
    if (i < 10) {
      return "0" + i;
    }
    return i.toString();
  }
  handleModelType(parsedData: any, data: any, organizationId: string, applicationId: string, RandomId: string, userId: string, user: string,PolicyId: string,origion: string) {
    let subject: string;
    let messageData: any;
    messageData = {
      objectdata: data,
      OrganizationId: organizationId,
      ApplicationId: applicationId,
      RandomId: RandomId,
      UserId: userId,
      User: user,
      PolicyId:PolicyId,
      Origion:origion
    };
    switch (parsedData.actiontag) {
      case 'GetModelType':
        subject = `app.exe.API.modelType`;
        break;
      case 'GetModelTypeById':
        subject = `app.exe.API.modelTypebyid`;
        break;
      case 'CreateModelType':
        subject = `app.exe.API.createModelType`;
        break;
      case 'UpdateModelType':
        subject = `app.exe.API.updateModelTypeId`;
        break;
      case 'DeleteModelType':
        subject = `app.exe.API.deleteModelTypeId`;
        break;
      case 'DomainModelTypeById':
        subject = `app.exe.API.domainModelTypeById`;
        break;
      case 'ActionRuleCrud':
        subject = `app.exe.API.actionRuleCrud`;
        break;
      case 'PolicyMappingCrud':
        subject = `app.exe.API.policyMappingCrud`;
        break;
      case 'ManageActionCrud':
        subject = `app.exe.API.manageActionCrud`;
        break;
      case 'GetBuildermenu':
        subject = `app.exe.API.getBuildermenu`;
        break;
      case 'GetCloneApplication':
        subject = `app.exe.API.getCloneApplication`;
        break;
      case 'PostDefaultApplication':
        subject = `app.exe.API.postDefaultApplication`;
        break;
      case 'PostCreateTable':
        subject = `app.exe.API.createTable`;
        break;
      case 'DeleteDropColumn':
        subject = `app.exe.API.dropcolumn`;
        break;
      case 'DeleteDropTable':
        subject = `app.exe.API.dropTable`;
        break;
      case 'GetSampleScreen':
        subject = `app.exe.API.sampleScreen`;
        break;
      case 'CheckUserScreen':
        subject = `app.exe.API.checkUserScreen`;
        break;
      case 'GetUserPolicyMenu':
        subject = `app.exe.API.getUserPolicyMenu`;
        break;
      case 'GetUserCommentsByApp':
        subject = `app.exe.API.getUserCommentsByApp`;
        break;
      case 'PostPageCreate':
        subject = `app.exe.Page.create`;
        break;
      case 'PostPageExecuteAction':
        subject = `app.exe.Page.excecuteaction`;
        break;
      case 'PostPageExecuteRules':
        subject = `app.exe.Page.executerules`;
        break;
      case 'PostPageExecuteDelete':
        subject = `app.exe.Page.executedelete`;
        break;
      case 'GetPageExecuteRules':
        subject = `app.exe.Page.getexecuterule`;
        break;
      case 'GetPageGetAction':
        subject = `app.exe.Page.getaction`;
        break;
      case 'PostPageExecuteQuery':
        subject = `app.exe.Page.executequery`;
        break;
        case 'AuthRegister':
        subject = `app.Auth.Register`;
        break;
        case 'AuthExternalSignup':
        subject = `app.Auth.ExternalSignup`;
        break;
        case 'AuthLogin':
        subject = `app.Auth.Login`;
        break;
        case 'AuthResetPassword':
        subject = `app.Auth.ResetPassword`;
        break;
        case 'AuthForget':
        subject = `app.Auth.Forget`;
        break;
        case 'AuthGetAppDetais':
        subject = `app.Auth.GetAppDetais`;
        break;
        case 'AuthGetByDomain':
        subject = `app.Auth.GetByDomain`;
        break;
      default:
        subject = `app.res.${RandomId}`;
        messageData = {
          message: "Wrong Action Type",
        };
        break;

    }
    // Optionally, you can return the subject and messageData if needed
    return { subject, messageData };
  }
}
