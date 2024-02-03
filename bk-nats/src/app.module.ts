import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common/common.module';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
// import { PageModule } from './models/page/page.module';
// import { CrudModule } from './models/crud/crud.module';
import { EmailModule } from './email/email.module';
import { S3FileManagerModule } from './s3-file-manager/s3-file-manager.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EMAIL_CONFIG } from './shared/config/global-db-config';
import { MulterModule } from '@nestjs/platform-express';
import { NatsService } from './nats/nats.service';
import { NatsModule } from './nats/nats.module';
import { SubjectHandlerService } from './shared/services/subjecthandler/subjecthandler.service';
import { PageModule } from './page/page.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger.service';

@Module({
  imports: [AuthModule,NatsModule,ApiModule, EmailModule , S3FileManagerModule,PageModule,LoggerModule,
    MulterModule.register({
      dest: './uploads', // Specify the directory where uploaded files will be stored.
    }),
    MailerModule.forRoot({
      transport: {
        host: EMAIL_CONFIG.EMAIL.host,
        port: EMAIL_CONFIG.EMAIL.port,
        secure: EMAIL_CONFIG.EMAIL.secure, // true for 465, false for other ports
        auth: {
          user: EMAIL_CONFIG.EMAIL.user, // generated ethereal user
          pass: EMAIL_CONFIG.EMAIL.pass // generated ethereal password
        },
      },
      defaults: {
        from: EMAIL_CONFIG.EMAIL.from, // outgoing email ID
      }
    }),],
  controllers: [AppController],
  providers: [AppService,NatsService,SubjectHandlerService,LoggerService],
})
export class AppModule {}
