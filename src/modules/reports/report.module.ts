import { Module } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { MonthlyReportService } from './monthly-report.service';
import { ReportService } from './report.service';
import { EmailService, CsvService, S3Client } from 'src/shared';
import { DbService } from './db.service';

@Module({
  providers: [
    DailyReportService,
    MonthlyReportService,
    ReportService,
    EmailService,
    S3Client,
    CsvService,
    DbService,
  ],
  exports: [DailyReportService, MonthlyReportService, ReportService],
})
export class ReportsModule {}
