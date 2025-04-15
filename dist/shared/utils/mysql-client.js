"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDBClient = void 0;
const promise_1 = require("mysql2/promise");
class MysqlDBClient {
    constructor() {
        this.mysqlConfig = {
            host: process.env.IrechargeHost,
            user: process.env.IrechargeUser,
            password: process.env.IrechargePassword,
            database: process.env.IrechargeDatabase,
            port: Number(process.env.IrechargePort),
        };
    }
    async connect() {
        if (this.mysqlConnection) {
            return this.mysqlConnection;
        }
        try {
            this.mysqlConnection = await promise_1.default.createConnection(this.mysqlConfig);
            console.log('Successfully connected to MySQL');
            return this.mysqlConnection;
        }
        catch (err) {
            console.error('MySQL connection error:', err);
            throw err;
        }
    }
    async disconnectFromMySQL() {
        if (!this.mysqlConnection) {
            console.warn('No active MySQL connection to close.');
            return;
        }
        try {
            await this.mysqlConnection.end();
            console.log('Closed MySQL connection');
        }
        catch (err) {
            console.error('MySQL disconnection error:', err);
            throw err;
        }
        finally {
            this.mysqlConnection = undefined;
        }
    }
}
exports.MysqlDBClient = MysqlDBClient;
//# sourceMappingURL=mysql-client.js.map