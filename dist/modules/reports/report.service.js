"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const shared_1 = require("../../shared");
const db_service_1 = require("./db.service");
let ReportService = class ReportService {
    constructor(s3Service, emailService, csvService, dbService) {
        this.s3Service = s3Service;
        this.emailService = emailService;
        this.csvService = csvService;
        this.dbService = dbService;
    }
    async generateReport(schedule, userId, email) {
        const results = await this.fetchData(this.getQuery(schedule), [userId]);
        const queryDate = this.getCurrentDateForSchedule(schedule);
        const filePath = this.prepareCsvFile(schedule, results);
        await this.s3Service.zipAndUploadFolderToS3(queryDate, path.dirname(filePath), `${schedule}`);
        const downloadLink = this.s3Service.getDownloadLink(path.dirname(filePath), `transactions_${queryDate}/transactions.zip`, `${schedule}`);
        await this.emailService.sendReportEmail(email, `${schedule.toUpperCase()} Report`, downloadLink);
        return true;
    }
    async generatePowerReport(schedule, userId, email) {
        const results = await this.fetchData(this.getPowerQuery(schedule), [
            userId,
        ]);
        const queryDate = this.getCurrentDateForSchedule(schedule);
        const filePath = this.prepareCsvFile(schedule, results);
        await this.s3Service.zipAndUploadFolderToS3(queryDate, path.dirname(filePath), schedule.toUpperCase());
        const downloadLink = this.s3Service.getDownloadLink(path.dirname(filePath), `transactions_${queryDate}/transactions.zip`, schedule.toUpperCase());
        await this.emailService.sendReportEmail(email, `${schedule.toUpperCase()} Power Report`, downloadLink);
        return true;
    }
    async fetchData(query, params) {
        try {
            return await this.dbService.query(query, params);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch report data');
        }
    }
    getQuery(schedule) {
        const reportQuery = `
    SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, amount, token, unit, phone, status
    FROM power_transactionitems 
    WHERE user = '129320' AND datecreated = '${this.getCurrentDateForSchedule(schedule)}';
  `;
        return reportQuery;
    }
    getPowerQuery(schedule) {
        const reportQuery = `
    SELECT time_stamp, userid, platform, service, customer_name, customer_info, receiver, util_receipt, amount, amount_paid, amount, token, unit, phone, status
    FROM power_transactionitems 
    WHERE user = '129320' AND datecreated = '${this.getCurrentDateForSchedule(schedule)}';
  `;
        return reportQuery;
    }
    getCurrentDateForSchedule(schedule) {
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
    prepareCsvFile(schedule, data) {
        const tempFolderPath = path.join('/tmp', 'reports');
        if (!fs.existsSync(tempFolderPath))
            fs.mkdirSync(tempFolderPath, { recursive: true });
        const existingFiles = fs.readdirSync(tempFolderPath);
        existingFiles.forEach((file) => {
            fs.unlinkSync(path.join(tempFolderPath, file));
        });
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
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_1.S3Client,
        shared_1.EmailService,
        shared_1.CsvService,
        db_service_1.DbService])
], ReportService);
//# sourceMappingURL=report.service.js.map