import { IsString, IsBoolean, IsArray, IsOptional, MinLength, MaxLength, ArrayMaxSize, maxLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateStudySetDto {
    @IsString()
    @MinLength(1, { message: ' This title is not empty' })
    @MaxLength(200, { message: 'Max title is 200 characters' })
    @Transform(({ value }) => value?.trim())
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    @Transform(({ value }) => value?.trim())
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_public?: boolean = false;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10, { message: 'Max size is 10' })
    @Transform(({ value }) => value?.map((t: string) => t.trim().toLowerCase()))
    tags?: string[] = [];

}