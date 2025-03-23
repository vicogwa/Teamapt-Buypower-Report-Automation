import { Injectable } from '@nestjs/common';
import { ReportService } from './report.service';

@Injectable()
export class MonthlyReportService {
  constructor(private readonly reportService: ReportService) {}

  async generateMonthlyReport(
    userId: number,
    email: string,
    type: 'wallet' | 'power',
  ) {
    if (type === 'wallet') {
      return this.reportService.generateReport('monthly', userId, email);
    } else if (type === 'power') {
      return this.reportService.generatePowerReport('monthly', userId, email);
    }
  }
}
