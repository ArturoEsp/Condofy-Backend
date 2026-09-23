import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import {
  StorageService,
  UploadFileParams,
  UploadFileResult,
  StoragePathParams,
} from '@/core/domain/services/storage.service';

@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT');
    const accessKeyId = this.configService.get<string>('STORAGE_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'STORAGE_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('STORAGE_REGION') || 'auto';
    this.bucketName =
      this.configService.get<string>('STORAGE_BUCKET_NAME') ||
      'condofy-storage';
    this.publicUrl = this.configService.get<string>('STORAGE_PUBLIC_URL');

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(
        `Cliente S3/R2 inicializado para el bucket: ${this.bucketName}`,
      );
    } else {
      this.logger.warn(
        'Credenciales de STORAGE (S3/R2) no configuradas. El servicio funcionará en modo simulación para desarrollo.',
      );
    }
  }

  async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    const contentType = params.contentType || params.file.mimetype;

    if (!this.s3Client) {
      this.logger.log(
        `[DEV MODE - Storage Simulation] Archivo simulado guardado en ruta: ${params.path} (${contentType})`,
      );
      const simulatedUrl = this.publicUrl
        ? `${this.publicUrl.replace(/\/+$/, '')}/${params.path}`
        : `https://storage-simulation.local/${params.path}`;
      return {
        key: params.path,
        url: simulatedUrl,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: params.path,
        Body: params.file.buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      let url: string;
      if (params.isPublic && this.publicUrl) {
        url = `${this.publicUrl.replace(/\/+$/, '')}/${params.path}`;
      } else {
        // Para archivos privados o si no hay publicUrl, generamos presigned URL de 1 hora
        url = await this.getPresignedUrl(params.path, 3600);
      }

      return {
        key: params.path,
        url,
      };
    } catch (err: any) {
      this.logger.error(
        `Error al subir archivo a S3/R2 (${params.path}): ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async getPresignedUrl(
    key: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    if (!this.s3Client) {
      return `https://storage-simulation.local/${key}?token=simulated_presigned_url`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (err: any) {
      this.logger.error(
        `Error al generar Presigned URL para ${key}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) {
      this.logger.log(
        `[DEV MODE - Storage Simulation] Eliminación simulada de: ${key}`,
      );
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (err: any) {
      this.logger.error(
        `Error al eliminar archivo en S3/R2 (${key}): ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  buildStoragePath(params: StoragePathParams): string {
    const rawFileName = params.fileName || 'file';
    const cleanFileName = rawFileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    const uniqueId = crypto.randomUUID();
    const modulePrefix = params.module.toLowerCase().trim();
    const refPrefix = params.referenceId ? `${params.referenceId}/` : '';

    return `condominiums/${params.condominiumId}/${modulePrefix}/${refPrefix}${uniqueId}_${cleanFileName}`;
  }
}
