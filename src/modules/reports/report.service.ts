import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as dayjs from 'dayjs';
import { EmailService, CsvService, S3Client } from 'src/shared';
import { DbService } from './db.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly s3Service: S3Client,
    private readonly emailService: EmailService,
    private readonly csvService: CsvService,
    private readonly dbService: DbService,
  ) {}

  async generateReport(
    schedule: string,
    userId: number,
    email: string,
  ): Promise<boolean> {
    const results = await this.fetchData(this.getQuery(schedule), [userId]);
    const queryDate = this.getCurrentDateForSchedule(schedule);
    console.log('RESULTS', results);
    const filePath = this.prepareCsvFile(schedule, results);

    await this.s3Service.zipAndUploadFolderToS3(
      queryDate,
      path.dirname(filePath),
      `${schedule} Report`,
    );
    const downloadLink = await this.s3Service.getDownloadLink(
      `transactions_${queryDate}/transactions.zip`,
      schedule.toUpperCase(),
    );

    await this.emailService.sendReportEmail(
      email,
      `${schedule.toUpperCase()} Report`,
      downloadLink,
    );
    return true;
  }

  async generatePowerReport(
    schedule: string,
    userId: number,
    email: string,
  ): Promise<boolean> {
    const results = await this.fetchData(this.getPowerQuery(schedule), [
      userId,
    ]);
    const queryDate = this.getCurrentDateForSchedule(schedule);

    const filePath = this.prepareCsvFile(schedule, results);

    await this.s3Service.zipAndUploadFolderToS3(
      queryDate,
      path.dirname(filePath),
      `${schedule} Power Report`,
    );
    const downloadLink = await this.s3Service.getDownloadLink(
      `transactions_${queryDate}/transactions.zip`,
      schedule.toUpperCase(),
    );

    await this.emailService.sendReportEmail(
      email,
      `${schedule.toUpperCase()} Power Report`,
      downloadLink,
    );
    return true;
  }

  private async fetchData(query: string, params: any[]): Promise<any[]> {
    try {
      return await this.dbService.query(query, params);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Failed to fetch report data');
    }
  }

  private getQuery(schedule: string): string {
    const reportQuery = `
    SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, amount, token, unit, phone, status
    FROM power_transactionitems 
    WHERE user = '129320' AND datecreated = '${this.getCurrentDateForSchedule(schedule)}';
  `;

    console.log(reportQuery);
    return reportQuery;
  }

  private getPowerQuery(schedule: string): string {
    const reportQuery = `
    SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, amount, token, unit, phone, status
    FROM power_transactionitems 
    WHERE user = '129320' AND datecreated = '${this.getCurrentDateForSchedule(schedule)}';
  `;

    console.log(reportQuery);
    return reportQuery;
  }

  private getCurrentDateForSchedule(schedule: string): string {
    switch (schedule.toLowerCase()) {
      case 'daily':
        return dayjs().format('YYYY-MM-DD');
      case 'weekly':
        return dayjs().startOf('week').format('YYYY-MM-DD');
      case 'monthly':
        return dayjs().startOf('month').format('YYYY-MM-DD');
      default:
        throw new Error('Invalid schedule type');
    }
  }

  private prepareCsvFile(schedule: string, data: any[]): string {
    console.log('DATA', data);
    const tempFolderPath = path.join('/tmp', 'reports');
    if (!fs.existsSync(tempFolderPath))
      fs.mkdirSync(tempFolderPath, { recursive: true });

    const fileName = `${schedule}-report-${Date.now()}.csv`;
    const filePath = path.join(tempFolderPath, fileName);

    const csvHeaders = [
      { id: 'time_stamp', title: 'Timestamp' },
      { id: 'category', title: 'Category' },
      { id: 'details', title: 'Details' },
      { id: 'amount', title: 'Amount' },
      { id: 'balance_snapshot', title: 'Balance Snapshot' },
      { id: 'recharge_type', title: 'Recharge Type' },
      { id: 'service', title: 'Service' },
      { id: 'customer_reference', title: 'Customer Reference' },
    ];

    this.csvService.generateCSV(csvHeaders, data, filePath);
    return filePath;
  }
}
