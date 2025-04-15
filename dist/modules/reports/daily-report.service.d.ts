import { ReportService } from './report.service';
export declare class DailyReportService {
    private readonly reportService;
    constructor(reportService: ReportService);
    generateDailyReport(userId: number, email: string, type: 'wallet' | 'power'): Promise<boolean | undefined>;
}
