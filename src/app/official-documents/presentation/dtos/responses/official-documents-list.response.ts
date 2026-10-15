import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OfficialDocumentResponse } from './official-document.response';

export class OfficialDocumentsListResponse {
  @ApiProperty({ type: [OfficialDocumentResponse] })
  @Expose()
  @Type(() => OfficialDocumentResponse)
  documents: OfficialDocumentResponse[];

  @ApiProperty({ example: 42 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 20 })
  @Expose()
  limit: number;
}

