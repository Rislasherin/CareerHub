export interface UploadMetadata {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}
export interface IStorageService {
  uploadFile(file: Express.Multer.File | Buffer, folder: string): Promise<string>;
  uploadFileWithMetadata(file:Express.Multer.File,folder:string): Promise<UploadMetadata>
  deleteFile(publicId:string):Promise<void>



}

