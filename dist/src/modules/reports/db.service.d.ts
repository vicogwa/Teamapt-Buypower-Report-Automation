import { DataSource } from 'typeorm';
export declare class DbService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    query<T = any>(sql: string, params: any[]): Promise<T[]>;
}
