export declare class EmailService {
    private ses;
    sendReportEmail(email: string, subject: string, reportUrl: string): Promise<void>;
}
