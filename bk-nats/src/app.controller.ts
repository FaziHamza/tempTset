import { Body, Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext } from '@nestjs/microservices';
import { Codec, NatsConnection, StringCodec } from 'nats';
import { NatsService } from 'src/nats/nats.service';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
@Controller()
export class AppController {

  constructor(private readonly natservice: NatsService, private readonly subjecthandlerservice: SubjectHandlerService) {

  }

  @EventPattern('app.req.*')
  async apprequest(@Body() data: string, @Ctx() context: NatsContext): Promise<void> {
    try {
      const parsedData = this.subjecthandlerservice.stringifyAndParseObject(data)
      // console.log(parsedData)
      console.log(parsedData.metaInfo)
      await this.natservice.publishstandardloggerMessage(`app.req`,parsedData.metaInfo.RequestId)
      const RandomId = this.natservice.extractRandomIdFromSubject(context.getSubject());
      var headers = context.getHeaders();
      const applicationId = headers.get('applicationid');
      const organizationId = headers.get('organizationid');
      const userId = headers.get('userid');
      const user = headers.get('user');
      const PolicyId = headers.get('PolicyId');
      const origion = headers.get('Origion');
      const result = this.subjecthandlerservice.handleModelType(parsedData.metaInfo, data, organizationId, applicationId, RandomId, userId,user,PolicyId,origion);
      await this.natservice.publishMessage(result.subject, (result.messageData),null);
    } catch (error) {
      const userId = this.natservice.extractRandomIdFromSubject(context.getSubject());
      const AuthFailed = {
        type: 'UnAuthorized',
        response: `Auth Failed +${error}`,
        UserId: userId
      }
      this.natservice.publishMessage(`app.res.${userId}`, JSON.stringify(AuthFailed))
      console.error('Error apprequest:', error);
    }
  }

}
