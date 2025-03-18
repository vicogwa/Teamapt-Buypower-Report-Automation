import * as dotev from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotev.config();

const config: ConfigService = new ConfigService();

export default () => ({
  irechargeDb: {
    dbName: config.get<string>('DB_NAME'),
    dbPort: config.get<number>('DB_PORT'),
    dbPass: config.get<string>('DB_PASS'),
    dbUser: config.get<string>('DB_USER'),
    dbHost: config.get<string>('DB_HOST'),
  },
});
