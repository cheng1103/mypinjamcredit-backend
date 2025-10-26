import { Injectable } from '@nestjs/common';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class JsonDbService {
  private readonly dataDir = join(process.cwd(), 'data');

  async ensureDataDir(): Promise<void> {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  async read<T>(collection: string): Promise<T[]> {
    try {
      await this.ensureDataDir();
      const filePath = join(this.dataDir, `${collection}.json`);

      if (!existsSync(filePath)) {
        return [];
      }

      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  async write<T>(collection: string, data: T[]): Promise<void> {
    try {
      await this.ensureDataDir();
      const filePath = join(this.dataDir, `${collection}.json`);
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing ${collection}:`, error);
      throw error;
    }
  }

  async findAll<T>(collection: string): Promise<T[]> {
    return this.read<T>(collection);
  }

  async findOne<T>(collection: string, predicate: (item: T) => boolean): Promise<T | undefined> {
    const items = await this.read<T>(collection);
    return items.find(predicate);
  }

  async create<T>(collection: string, item: T): Promise<T> {
    const items = await this.read<T>(collection);
    items.push(item);
    await this.write(collection, items);
    return item;
  }

  async update<T>(
    collection: string,
    predicate: (item: T) => boolean,
    updateFn: (item: T) => T
  ): Promise<T | undefined> {
    const items = await this.read<T>(collection);
    const index = items.findIndex(predicate);

    if (index === -1) {
      return undefined;
    }

    items[index] = updateFn(items[index]);
    await this.write(collection, items);
    return items[index];
  }

  async delete<T>(collection: string, predicate: (item: T) => boolean): Promise<boolean> {
    const items = await this.read<T>(collection);
    const newItems = items.filter(item => !predicate(item));

    if (newItems.length === items.length) {
      return false;
    }

    await this.write(collection, newItems);
    return true;
  }
}
