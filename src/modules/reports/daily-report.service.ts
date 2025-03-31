import { Injectable } from '@nestjs/common';
import { ReportService } from './report.service';

@Injectable()
export class DailyReportService {
  constructor(private readonly reportService: ReportService) {}

  
  async generateDailyReport(
    userId: number,
    email: string,
    type: 'wallet' | 'power',
  ) {
    
    if (type === 'wallet') {
      return this.reportService.generateReport('daily', 'WalletMerchant', userId, email);
    }
    
    else if (type === 'power') {
      return this.reportService.generateReport('daily', 'BuyPower', userId, email);
    }
  }
}
