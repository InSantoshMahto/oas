import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Cat } from './entities/cat.entity';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatQueryDto } from './dto/cat-query.dto';

export interface PaginatedCats {
  items: Cat[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class CatsService {
  /** In-memory store — replace with a TypeORM/Prisma repository in production */
  private readonly store: Cat[] = [
    {
      id: 1,
      name: 'Whiskers',
      age: 3,
      breed: 'Siamese',
      color: 'white',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: 2,
      name: 'Luna',
      age: 2,
      breed: 'Persian',
      color: 'grey',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05'),
    },
    {
      id: 3,
      name: 'Simba',
      age: 5,
      breed: 'Maine Coon',
      color: 'brown',
      createdAt: new Date('2023-11-20'),
      updatedAt: new Date('2024-03-01'),
    },
    {
      id: 4,
      name: 'Nala',
      age: 1,
      breed: 'Bengal',
      color: 'spotted',
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-04-15'),
    },
    {
      id: 5,
      name: 'Oliver',
      age: 4,
      breed: 'British Shorthair',
      color: 'blue',
      createdAt: new Date('2023-09-01'),
      updatedAt: new Date('2024-01-20'),
    },
  ];

  private nextId = 6;

  // ─── Queries ───────────────────────────────────────────────────────────

  findAll(query: CatQueryDto): PaginatedCats {
    const { page = 1, limit = 10, breed, name } = query;

    let items = [...this.store];

    if (breed) {
      items = items.filter((c) =>
        c.breed.toLowerCase().includes(breed.toLowerCase()),
      );
    }
    if (name) {
      items = items.filter((c) =>
        c.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    const total      = items.length;
    const totalPages = Math.ceil(total / limit);
    const start      = (page - 1) * limit;
    const paged      = items.slice(start, start + limit);

    return {
      items: paged,
      meta: { total, page, limit, totalPages },
    };
  }

  findOne(id: number): Cat {
    const cat = this.store.find((c) => c.id === id);
    if (!cat) throw new NotFoundException(`Cat #${id} not found`);
    return cat;
  }

  // ─── Mutations ────────────────────────────────────────────────────────

  create(dto: CreateCatDto): Cat {
    const duplicate = this.store.find(
      (c) => c.name.toLowerCase() === dto.name.toLowerCase(),
    );
    if (duplicate) {
      throw new ConflictException(`A cat named "${dto.name}" already exists`);
    }

    const now = new Date();
    const cat: Cat = {
      id: this.nextId++,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    this.store.push(cat);
    return cat;
  }

  update(id: number, dto: UpdateCatDto): Cat {
    const index = this.store.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Cat #${id} not found`);

    const updated: Cat = {
      ...this.store[index],
      ...dto,
      id,
      updatedAt: new Date(),
    };
    this.store[index] = updated;
    return updated;
  }

  remove(id: number): void {
    const index = this.store.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Cat #${id} not found`);
    this.store.splice(index, 1);
  }
}
