import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyProgress, StudyProgressSchema } from './schemas/study-progress.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { CardsModule } from '../cards/cards.module';
import { StudySetsModule } from '../study-sets/study-sets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyProgress.name, schema: StudyProgressSchema },
    ]),
    StudySetsModule,
    CardsModule,
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}