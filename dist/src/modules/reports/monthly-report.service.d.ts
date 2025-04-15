import { ReportService } from './report.service';
export declare class MonthlyReportService {
    private readonly reportService;
    constructor(reportService: ReportService);
    generateMonthlyReport(userId: number, email: string, type: 'wallet' | 'power'): Promise<boolean | undefined>;
}
