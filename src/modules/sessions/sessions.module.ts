import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudySession, StudySessionSchema } from './schemas/study-session.schema';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { StudySetsModule } from '../study-sets/study-sets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudySession.name, schema: StudySessionSchema },
    ]),
    StudySetsModule,
  ],
  providers: [SessionsService],
  controllers: [SessionsController],
})
export class SessionsModule {}