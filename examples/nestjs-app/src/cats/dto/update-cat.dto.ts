import { PartialType } from '@nestjs/swagger';
import { CreateCatDto } from './create-cat.dto';

/**
 * All fields from CreateCatDto become optional — perfect for PATCH semantics.
 * PartialType from @nestjs/swagger also preserves the @ApiProperty decorators.
 */
export class UpdateCatDto extends PartialType(CreateCatDto) {}
