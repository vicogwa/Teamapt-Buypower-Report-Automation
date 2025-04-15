"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotev = require("dotenv");
const config_1 = require("@nestjs/config");
dotev.config();
const config = new config_1.ConfigService();
exports.default = () => ({
    irechargeDb: {
        dbName: config.get('DB_NAME'),
        dbPort: config.get('DB_PORT'),
        dbPass: config.get('DB_PASS'),
        dbUser: config.get('DB_USER'),
        dbHost: config.get('DB_HOST'),
    },
});
//# sourceMappingURL=configuration.js.map