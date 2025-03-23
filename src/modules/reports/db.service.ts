import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbService {
  constructor(private readonly dataSource: DataSource) {}

  async query<T = any>(sql: string, params: any[]): Promise<T[]> {
    try {
      return await this.dataSource.query(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Database query failed');
    }
  }
}
