import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatQueryDto } from './dto/cat-query.dto';
import { Cat } from './entities/cat.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/guards/auth.guard';

@ApiTags('cats')
@ApiBearerAuth('jwt')
@ApiSecurity('apiKey')
@ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' })
@Controller({ path: 'cats', version: '1' })
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  // ─── List ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'List cats',
    description: 'Returns a paginated, filterable list of cats.',
  })
  @ApiOkResponse({
    description: 'Paginated list of cats',
    schema: {
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/Cat' } },
        meta: {
          type: 'object',
          properties: {
            total:      { type: 'integer', example: 5 },
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 1 },
          },
        },
      },
    },
  })
  findAll(@Query() query: CatQueryDto, @CurrentUser() user: AuthUser) {
    return this.catsService.findAll(query);
  }

  // ─── Get one ──────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a cat by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Cat ID', example: 1 })
  @ApiOkResponse({ type: Cat, description: 'The requested cat' })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Cat {
    return this.catsService.findOne(id);
  }

  // ─── Create ───────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a cat' })
  @ApiCreatedResponse({ type: Cat, description: 'The newly created cat' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'A cat with that name already exists' })
  create(@Body() dto: CreateCatDto): Cat {
    return this.catsService.create(dto);
  }

  // ─── Update ───────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a cat',
    description: 'Partial update — only provided fields are changed.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Cat, description: 'The updated cat' })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCatDto,
  ): Cat {
    return this.catsService.update(id, dto);
  }

  // ─── Delete ───────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a cat' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Cat successfully deleted' })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.catsService.remove(id);
  }
}
