import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyReportService } from '../reports/daily-report.service';
import { MonthlyReportService } from '../reports/monthly-report.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly dailyReportService: DailyReportService,
    private readonly monthlyReportService: MonthlyReportService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyReports() {
    console.log('Running daily reports...');
    await this.dailyReportService.generateDailyReport(
      129320,
      'victoriafrancis885@gmail.com',
      'wallet',
    );
    await this.dailyReportService.generateDailyReport(
      129320,
      'victoriafrancis885@gmail.com',
      'power',
    );
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReports() {
    console.log('Running monthly reports...');
    await this.monthlyReportService.generateMonthlyReport(
      27688,
      'victoriafrancis885@gmail.com',
      'wallet',
    );
    await this.monthlyReportService.generateMonthlyReport(
      27688,
      'victoriafrancis885@gmail.com',
      'power',
    );
  }
}
