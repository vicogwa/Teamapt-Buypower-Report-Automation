import * as AWS from 'aws-sdk';
export declare class S3Client {
    private readonly s3BucketName;
    s3: AWS.S3;
    zipAndUploadFolderToS3(queryDate: string, folderPath: string, subject: string): Promise<void>;
    zipFolder(folderPath: string, outputFilePath: string): Promise<void>;
    uploadToS3(folderPath: string, fileName: string, fileContent: Buffer, subject: string): Promise<void>;
    getDownloadLink(folderPath: string, fileName: string, subject: string): string;
    getFileName(serviceName: string, queryDate: string): string;
    capitalizeFirstLetter(string: string): string;
}
