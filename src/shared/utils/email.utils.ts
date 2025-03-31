import * as AWS from 'aws-sdk';

export class EmailService {
  private ses = new AWS.SES({
    region:  process.env.AWS_REGION,
    accessKeyId:  process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY, 
  });

  // Map merchants to their respective email addresses
  private merchantEmailMap: Record<string, string> = {
    BuyPower: 'victoriafrancis885@gmail.com',  
    TeamApt: 'victoriafrancis885@gmail.com',      
    Palmpay: 'victoriafrancis885@gmail.com',      
  };

  async sendReportEmail(
    merchant: string,  // Merchant name is passed
    subject: string,
    reportUrl: string,
  ): Promise<void> {
    const email = this.merchantEmailMap[merchant];  // Get the email based on merchant

    // If no email is found for the merchant, throw an error
    if (!email) {
      console.error(`No email found for merchant: ${merchant}`);
      throw new Error(`No email found for merchant: ${merchant}`);
    }

    const params = {
      Source: 'victoriafrancis885@gmail.com',
      Destination: {
        ToAddresses: [email],  // Send to the correct email address based on merchant
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: `Your ${subject} is ready`,
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: `Dear User,\n\nYour ${subject} is ready.\nYou can download it using the following link:\n${reportUrl}\n\nBest regards,\nThe iRecharge Team`,
          },
        },
      },
    };

    try {
      await this.ses.sendEmail(params).promise();
      console.log(`Email sent successfully to ${email}`);
    } catch (err) {
      console.error('Failed to send email:', err);
      throw err;
    }
  }
}
