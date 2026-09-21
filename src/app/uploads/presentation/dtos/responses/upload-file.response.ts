import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponse {
  @ApiProperty({
    description: 'Ruta/llave única del archivo dentro del bucket S3/R2',
    example:
      'condominiums/condo-123/parcels/d3b07384/a8f9b2c3-4d5e_evidence.jpg',
  })
  key: string;

  @ApiProperty({
    description:
      'URL para acceder al archivo (Presigned URL temporal para privados o URL directa para públicos)',
    example: 'https://...',
  })
  url: string;

  @ApiProperty({
    description: 'Nombre original del archivo subido',
    example: 'evidence.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1048576,
  })
  size: number;
}
