import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbService {
  constructor(private dataSource: DataSource) {}

  // Executes a query and returns the result
  async executeQuery(query: string, params: any[]): Promise<any[]> {
    try {
      const [rows] = await this.dataSource.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Database query failed');
    }
  }
}
