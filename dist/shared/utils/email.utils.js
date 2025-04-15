"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const AWS = require("aws-sdk");
class EmailService {
    constructor() {
        this.ses = new AWS.SES({
            region: 'eu-north-1',
        });
    }
    async sendReportEmail(email, subject, reportUrl) {
        const params = {
            Source: 'victoriafrancis885@gmail.com',
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: `Your ${subject} is ready`,
                },
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Dear User,\n\nYour ${subject} report is ready.\nYou can download it using the following link:\n${reportUrl}\n\nBest regards,\nThe iRecharge Team`,
                    },
                },
            },
        };
        try {
            await this.ses.sendEmail(params).promise();
            console.log('Email sent successfully');
        }
        catch (err) {
            console.error('Failed to send email:', err);
            throw err;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.utils.js.map