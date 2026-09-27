export class ExtraordinaryFeeDocumentEntity {
  id: string;
  extraordinaryFeeId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: string | null;
  uploadedAt: Date;
}
