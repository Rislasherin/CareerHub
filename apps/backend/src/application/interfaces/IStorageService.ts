export interface IStorageService {
  uploadFile(file: any, folder: string): Promise<string>;
}
