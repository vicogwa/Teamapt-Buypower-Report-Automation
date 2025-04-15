"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvService = void 0;
const csv_writer_1 = require("csv-writer");
class CsvService {
    async generateCSV(header, transactions, filePath) {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: filePath,
            header: header,
        });
        await csvWriter.writeRecords(transactions);
    }
}
exports.CsvService = CsvService;
//# sourceMappingURL=csv.utils.js.map