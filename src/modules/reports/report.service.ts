import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as dayjs from 'dayjs';
import { EmailService, CsvService, S3Client } from 'src/shared';
import { DbService } from './db.service';

@Injectable()
export class ReportService {
  generatePowerReport(arg0: string, userId: number, email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly s3Service: S3Client,
    private readonly emailService: EmailService,
    private readonly csvService: CsvService,
    private readonly dbService: DbService,
  ) {}

  async generateReport(schedule: string, merchant: string, userId: number, email: string) {
    const query = this.getQueryForMerchant(merchant, schedule, userId);
    const results = await this.fetchData(query, [userId]);
    const queryDate = this.getCurrentDateForSchedule(schedule);
    const filePath = this.prepareCsvFile(merchant, results, queryDate);

    await this.s3Service.zipAndUploadFolderToS3(queryDate, path.dirname(filePath), merchant);
    const downloadLink = this.s3Service.getDownloadLink(path.dirname(filePath), `${merchant}_${queryDate}/transactions.zip`, merchant);
    await this.emailService.sendReportEmail(email, `${merchant.toUpperCase()} Monthly Report`, downloadLink);

    return true;
  }

  async generateMerchantReport(schedule: string, merchant: string, userId: number, emailList: string[]): Promise<boolean> {
    const query = this.getQueryForMerchant(merchant, schedule, userId);
    const results = await this.fetchData(query, [userId]);
    const queryDate = this.getCurrentDateForSchedule(schedule);
    const filePath = this.prepareCsvFile(merchant, results, queryDate);

    await this.s3Service.zipAndUploadFolderToS3(queryDate, path.dirname(filePath), merchant);
    const downloadLink = this.s3Service.getDownloadLink(path.dirname(filePath), `${merchant}_${queryDate}/transactions.zip`, merchant);

    for (const email of emailList) {
      await this.emailService.sendReportEmail(email, `${merchant.toUpperCase()} Report`, downloadLink);
    }

    return true;
  }

  private getQueryForMerchant(merchant: string, schedule: string, userId: number): string {
    const date = this.getCurrentDateForSchedule(schedule);
    const queryMap: Record<string, string> = {
      BuyPower: `
        SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, token, unit, phone, status
        FROM power_transactionitems
        WHERE user = '${userId}' AND datecreated = '${date}';
      `,
      TeamApt: `
        SELECT transaction_id, transaction_date, customer_name, transaction_amount, service_type, receiver_name, phone_number, email
        FROM teamheart_transactions
        WHERE user = '${userId}' AND transaction_date = '${date}';
      `,
      PalmPay: `
        SELECT transaction_time, transaction_id, customer_name, amount_paid, receiver, transaction_status, phone_number
        FROM panpay_transactions
        WHERE user = '${userId}' AND transaction_date = '${date}';
      `,
    };
    return queryMap[merchant] || '';
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

  private prepareCsvFile(merchant: string, data: any[], queryDate: string): string {
    const tempFolderPath = path.join('/tmp', 'reports', merchant);
    if (!fs.existsSync(tempFolderPath)) fs.mkdirSync(tempFolderPath, { recursive: true });

    const fileName = `${merchant}-report-${queryDate}.csv`;
    const filePath = path.join(tempFolderPath, fileName);
    const csvHeaders = this.getCsvHeadersForMerchant(merchant);

    this.csvService.generateCSV(csvHeaders, data, filePath);
    return filePath;
  }

  private getCsvHeadersForMerchant(merchant: string): any[] {
    const headersMap: Record<string, any[]> = {
      BuyPower: [
        { id: 'time_stamp', title: 'Transaction ID' },
        { id: 'datecreated', title: 'Date' },
        { id: 'userid', title: 'Username' },
        { id: 'platform', title: 'Source' },
        { id: 'service', title: 'Utility' },
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'customer_info', title: 'Address' },
        { id: 'util_receipt', title: 'Meter Number' },
        { id: 'amount', title: 'Utility' },
        { id: 'token', title: 'Reference' },
        { id: 'amount_paid', title: 'Amount' },
        { id: 'status', title: 'Status' },
        { id: 'unit', title: 'Unit' },
        { id: 'phone', title: 'Phone' },
      ],
      TeamApt: [
        { id: 'transaction_id', title: 'Transaction ID' },
        { id: 'transaction_date', title: 'Transaction Date' },
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'transaction_amount', title: 'Transaction Amount' },
        { id: 'service_type', title: 'Service Type' },
        { id: 'receiver_name', title: 'Receiver Name' },
        { id: 'phone_number', title: 'Phone Number' },
        { id: 'email', title: 'Email' },
      ],
      PalmPay: [
        { id: 'transaction_time', title: 'Transaction Time' },
        { id: 'transaction_id', title: 'Transaction ID' },
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'amount_paid', title: 'Amount Paid' },
        { id: 'receiver', title: 'Receiver' },
        { id: 'transaction_status', title: 'Transaction Status' },
        { id: 'phone_number', title: 'Phone Number' },
      ],
    };
    return headersMap[merchant] || [];
  }

  private async fetchData(query: string, params: any[]): Promise<any[]> {
    try {
      return await this.dbService.executeQuery(query, params);
    } catch (error) {
      console.error(`Error fetching data for query: ${query}`, error);
      throw new Error('Error fetching data from the database');
    }
  }
}
