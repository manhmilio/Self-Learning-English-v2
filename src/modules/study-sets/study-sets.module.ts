import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudySet, StudySetSchema } from './schemas/study-set.schema';
import { StudySetsService } from './study-sets.service';
import { StudySetsController } from './study-sets.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: StudySet.name, schema: StudySetSchema }])
    ],
    providers: [StudySetsService],
    controllers: [StudySetsController],
    exports: [StudySetsService],
})

export class StudySetsModule {}