import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCardDto } from './create-card.dto';

export class BulkCreateCardDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Cần ít nhất 1 card' })
    @ArrayMaxSize(500, { message: 'Tối đa 500 cards mỗi lần' })
    @ValidateNested({ each: true })
    @Type(() => CreateCardDto)
    cards!: CreateCardDto[];
}