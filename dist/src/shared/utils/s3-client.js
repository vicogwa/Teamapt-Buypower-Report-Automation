"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Client = void 0;
const AWS = require("aws-sdk");
const fs = require("fs");
const archiver_1 = require("archiver");
class S3Client {
    constructor() {
        this.s3BucketName = 'report-export-glory';
        this.s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
    async zipAndUploadFolderToS3(queryDate, folderPath, subject) {
        const zipFilePath = `/tmp/${this.getFileName(subject, queryDate)}.zip`;
        await this.zipFolder(folderPath, zipFilePath);
        const fileContent = fs.readFileSync(zipFilePath);
        await this.uploadToS3(`transactions_${queryDate}`, `transactions_${queryDate}/transactions.zip`, fileContent, subject);
        fs.unlinkSync(zipFilePath);
    }
    async zipFolder(folderPath, outputFilePath) {
        const output = fs.createWriteStream(outputFilePath);
        const archive = (0, archiver_1.create)('zip', { zlib: { level: 9 } });
        fs.readdirSync(folderPath);
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                console.log(`Zipped folder: ${archive.pointer()} total bytes`);
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
    async uploadToS3(folderPath, fileName, fileContent, subject) {
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
        }
        catch (err) {
            console.error(`Error uploading to S3: ${fileName}`, err);
            throw err;
        }
    }
    getDownloadLink(folderPath, fileName, subject) {
        const key = `${this.capitalizeFirstLetter(subject)}-Export/${fileName}`;
        console.log('Generating download link for file with key:', key);
        const params = {
            Bucket: this.s3BucketName,
            Key: key,
            Expires: 60 * 60,
        };
        const url = this.s3.getSignedUrl('getObject', params);
        return url;
    }
    getFileName(serviceName, queryDate) {
        return `${this.capitalizeFirstLetter(serviceName)}_transactions_${queryDate}`;
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
}
exports.S3Client = S3Client;
//# sourceMappingURL=s3-client.js.map