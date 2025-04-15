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
exports.DailyReportService = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
let DailyReportService = class DailyReportService {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async generateDailyReport(userId, email, type) {
        if (type === 'wallet') {
            return this.reportService.generateReport('daily', userId, email);
        }
        else if (type === 'power') {
            return this.reportService.generatePowerReport('daily', userId, email);
        }
    }
};
exports.DailyReportService = DailyReportService;
exports.DailyReportService = DailyReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], DailyReportService);
//# sourceMappingURL=daily-report.service.js.map