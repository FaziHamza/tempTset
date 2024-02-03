import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
// import { AppService } from 'src/app.service';
// import { CommonModule } from 'src/common/common/common.module';
import { QueryGenratorService } from 'src/shared/services/query-genrator/query-genrator.service';
import { CrateDbService } from 'src/common/common/crateDb.service';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from 'src/nats/nats.service';
import { NatsModule } from 'src/nats/nats.module';
import { HashService } from 'src/shared/services/hash/hash.service';
import { CommonService } from 'src/shared/services/common/common.service';
import { EmailModule } from 'src/email/email.module';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports:[NatsModule, EmailModule],
  controllers: [ApiController],
  providers: [ApiService,QueryGenratorService,CrateDbService,HashService, CommonService,SubjectHandlerService,NatsService,LoggerService]
})
export class ApiModule {}
