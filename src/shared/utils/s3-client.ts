/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { create } from 'archiver';

export class S3Client {
  private readonly s3BucketName = 'report-export-glory';
  s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async zipAndUploadFolderToS3(
    queryDate: string,
    folderPath: string,
    subject: string,
  ): Promise<void> {
    const zipFilePath = `/tmp/${this.getFileName(subject, queryDate)}.zip`;

    await this.zipFolder(folderPath, zipFilePath);

    const fileContent = fs.readFileSync(zipFilePath);

    await this.uploadToS3(
      `transactions_${queryDate}`,
      `transactions_${queryDate}/transactions.zip`,
      fileContent,
      subject,
    );

    fs.unlinkSync(zipFilePath);
  }

  async zipFolder(folderPath: string, outputFilePath: string): Promise<void> {
    const output = fs.createWriteStream(outputFilePath);
    const archive = create('zip', { zlib: { level: 9 } });

    fs.readdirSync(folderPath);

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Zipped folder: ${archive.pointer()} total bytes`);

        // Check contents of the zip file for duplicates
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(outputFilePath);
        const zipEntries = zip.getEntries();

        console.log('Contents of the ZIP file:');
        zipEntries.forEach((entry) => console.log(entry.entryName));

        resolve();
      });

      output.on('error', reject);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(folderPath, false);
      archive.finalize().catch(reject);
    });
  }

  async uploadToS3(
    folderPath: string,
    fileName: string,
    fileContent: Buffer,
    subject: string,
  ): Promise<void> {
    const key = `${this.capitalizeFirstLetter(subject)}-Export/${fileName}`;

    const params = {
      Bucket: this.s3BucketName,
      Key: key,
      Body: fileContent,
      ContentType: 'application/zip',
    };

    try {
      await this.s3.putObject(params).promise();
      console.log(`Successfully uploaded: ${fileName}`);
    } catch (err) {
      console.error(`Error uploading to S3: ${fileName}`, err);
      throw err;
    }
  }

  getDownloadLink(folderPath: string, fileName: string, subject: string) {
    const key = `${this.capitalizeFirstLetter(subject)}-Export/${fileName}`;

    console.log('Generating download link for file with key:', key);

    const params = {
      Bucket: this.s3BucketName,
      Key: key,
      Expires: 60 * 60, // Link expires in 1 hour
    };

    const url = this.s3.getSignedUrl('getObject', params);
    return url;
  }

  getFileName(serviceName: string, queryDate: string): string {
    return `${this.capitalizeFirstLetter(serviceName)}_transactions_${queryDate}`;
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}
