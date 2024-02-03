import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { CommonModule } from 'src/common/common/common.module';
import { PageController } from './page.controller';
import { AppService } from 'src/app.service';
import { QueryGenratorService } from 'src/shared/services/query-genrator/query-genrator.service';
import { HashService } from 'src/shared/services/hash/hash.service';
import { EmailModule } from '../email/email.module';
import { TokenService } from '../token/token.service';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from 'src/nats/nats.service';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  imports:[NatsModule, CommonModule,EmailModule],
  controllers: [PageController],
  providers: [PageService,AppService,QueryGenratorService,HashService,TokenService,SubjectHandlerService,NatsService]
})
export class PageModule {}
