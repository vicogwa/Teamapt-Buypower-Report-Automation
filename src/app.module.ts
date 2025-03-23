import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ReportsModule } from './modules';
import { TasksModule } from './modules/tasks';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';

const config = configuration();
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      // imports: [ConfigModule], inject: [ConfigService], useFactory: (configService: ConfigService) => ({
      type: 'mysql',
      host: config.irechargeDb.dbHost,
      port: config.irechargeDb.dbPort,
      username: config.irechargeDb.dbUser,
      password: config.irechargeDb.dbPass,
      database: config.irechargeDb.dbName,
      synchronize: false,
    }),
    // }),
    ReportsModule,
    TasksModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
