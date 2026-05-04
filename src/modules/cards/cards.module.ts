import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schemas/card.schema';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { StudySetsModule } from '../study-sets/study-sets.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
        StudySetsModule,
    ],
    providers: [CardsService],
    controllers: [CardsController],
    exports: [CardsService],
})

export class CardsModule {}