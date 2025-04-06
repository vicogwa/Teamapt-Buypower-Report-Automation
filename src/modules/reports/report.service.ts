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
    const filePath = this.prepareCsvFile(schedule, results);

    await this.s3Service.zipAndUploadFolderToS3(
      queryDate,
      path.dirname(filePath),
      `${schedule}`,
    );
    const downloadLink = this.s3Service.getDownloadLink(
      path.dirname(filePath),
      `transactions_${queryDate}/transactions.zip`,
      `${schedule}`,
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
      schedule.toUpperCase(),
    );
    const downloadLink = this.s3Service.getDownloadLink(
      path.dirname(filePath),
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
    return reportQuery;
  }

  private getPowerQuery(schedule: string): string {
    const reportQuery = `
    SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, amount, token, unit, phone, status
    FROM power_transactionitems 
    WHERE user = '129320' AND datecreated = '${this.getCurrentDateForSchedule(schedule)}';
  `;
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
    const tempFolderPath = path.join('/tmp', 'reports');
    if (!fs.existsSync(tempFolderPath))
      fs.mkdirSync(tempFolderPath, { recursive: true });

    // Clean up the folder by deleting all existing files
    const existingFiles = fs.readdirSync(tempFolderPath);
    existingFiles.forEach((file) => {
      fs.unlinkSync(path.join(tempFolderPath, file));
    });

    // Use a consistent file name based on the schedule and current date
    const queryDate = this.getCurrentDateForSchedule(schedule);
    const fileName = `${schedule}-report-${queryDate}.csv`;
    const filePath = path.join(tempFolderPath, fileName);

    const csvHeaders = [
      { id: 'time_stamp', title: 'Timestamp' },
      { id: 'userid', title: 'Userid' },
      { id: 'platform', title: 'Platform' },
      { id: 'amount', title: 'Amount' },
      { id: 'amount_paid', title: 'Amount Paid' },
      { id: 'token', title: 'Token' },
      { id: 'unit', title: 'Unit' },
      { id: 'phone', title: 'Phone' },
      { id: 'util_receipt', title: 'Util Receipt' },
      { id: 'customer_name', title: 'Customer Name' },
      { id: 'customer_info', title: 'Customer Info' },
      { id: 'receiver', title: 'Receiver' },
      { id: 'service', title: 'Service' },
      { id: 'status', title: 'Status' },
    ];

    this.csvService.generateCSV(csvHeaders, data, filePath);
    return filePath;
  }
}
