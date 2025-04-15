import { EmailService, CsvService, S3Client } from 'src/shared';
import { DbService } from './db.service';
export declare class ReportService {
    private readonly s3Service;
    private readonly emailService;
    private readonly csvService;
    private readonly dbService;
    constructor(s3Service: S3Client, emailService: EmailService, csvService: CsvService, dbService: DbService);
    generateReport(schedule: string, userId: number, email: string): Promise<boolean>;
    generatePowerReport(schedule: string, userId: number, email: string): Promise<boolean>;
    private fetchData;
    private getQuery;
    private getPowerQuery;
    private getCurrentDateForSchedule;
    private prepareCsvFile;
}
