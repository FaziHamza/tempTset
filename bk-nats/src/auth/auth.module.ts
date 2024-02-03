import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from 'src/common/common/common.module';
import { HashService } from 'src/shared/services/hash/hash.service';
import { QueryGenratorService } from 'src/shared/services/query-genrator/query-genrator.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/shared/services/common/common.service';
import { RecaptchaService } from './recaptcha.service';
import { EmailModule } from '../email/email.module';
import { NatsModule } from 'src/nats/nats.module';
import { SubjectHandlerService } from 'src/shared/services/subjecthandler/subjecthandler.service';
import { NatsService } from 'src/nats/nats.service';

@Module({
    imports: [CommonModule , EmailModule,NatsModule],
    controllers: [AuthController],
    providers: [AuthService,HashService,JwtService,QueryGenratorService,CommonService,RecaptchaService,SubjectHandlerService,NatsService]
})
export class AuthModule {

}
