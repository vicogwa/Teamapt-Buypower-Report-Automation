"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const daily_report_service_1 = require("./daily-report.service");
const monthly_report_service_1 = require("./monthly-report.service");
const report_service_1 = require("./report.service");
const shared_1 = require("src/shared");
const db_service_1 = require("./db.service");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            daily_report_service_1.DailyReportService,
            monthly_report_service_1.MonthlyReportService,
            report_service_1.ReportService,
            shared_1.EmailService,
            shared_1.S3Client,
            shared_1.CsvService,
            db_service_1.DbService,
        ],
        exports: [daily_report_service_1.DailyReportService, monthly_report_service_1.MonthlyReportService, report_service_1.ReportService],
    })
], ReportsModule);
//# sourceMappingURL=report.module.js.map