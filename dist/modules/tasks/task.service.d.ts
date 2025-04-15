import { DailyReportService } from '../reports/daily-report.service';
import { MonthlyReportService } from '../reports/monthly-report.service';
export declare class TaskService {
    private readonly dailyReportService;
    private readonly monthlyReportService;
    constructor(dailyReportService: DailyReportService, monthlyReportService: MonthlyReportService);
    handleDailyReports(): Promise<void>;
    handleMonthlyReports(): Promise<void>;
}
