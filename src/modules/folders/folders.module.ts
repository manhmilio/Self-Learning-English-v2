import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Folder, FolderSchema } from './schemas/folder.schema';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { StudySetsModule } from '../study-sets/study-sets.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
        StudySetsModule,
    ],
    providers: [FoldersService],
    controllers: [FoldersController],
})

export class FoldersModule {}
