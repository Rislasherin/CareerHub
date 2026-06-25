export interface IStorageService {
  uploadFile(file: Express.Multer.File | Buffer, folder: string): Promise<string>;
}
