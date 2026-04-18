import { PartialType } from '@nestjs/mapped-types';
import { CreateStudySetDto } from './create-study-set.dto';

// PartialType tự động làm tất cả field của CreateStudySetDto thành optional
export class UpdateStudySetDto extends PartialType(CreateStudySetDto) {}