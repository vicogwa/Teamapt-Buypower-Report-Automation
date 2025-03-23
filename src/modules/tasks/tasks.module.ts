import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from '../reports';
import { TaskService } from './task.service';

@Module({
  imports: [ScheduleModule.forRoot(), ReportsModule],
  providers: [TaskService],
})
export class TasksModule {}
