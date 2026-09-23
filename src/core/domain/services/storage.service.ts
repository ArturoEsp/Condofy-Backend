export interface StorageFile {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
}

export interface UploadFileParams {
  file: StorageFile;
  path: string;
  isPublic?: boolean;
  contentType?: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
}

export interface StoragePathParams {
  condominiumId: string;
  module: string;
  fileName: string;
  referenceId?: string;
}

export interface StorageService {
  uploadFile(params: UploadFileParams): Promise<UploadFileResult>;
  getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
  buildStoragePath(params: StoragePathParams): string;
}
