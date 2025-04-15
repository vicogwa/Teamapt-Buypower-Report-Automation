import mysql from 'mysql2/promise';
export declare class MysqlDBClient {
    private mysqlConnection?;
    protected readonly mysqlConfig: {
        host: string | undefined;
        user: string | undefined;
        password: string | undefined;
        database: string | undefined;
        port: number;
    };
    connect(): Promise<mysql.Connection>;
    disconnectFromMySQL(): Promise<void>;
}
