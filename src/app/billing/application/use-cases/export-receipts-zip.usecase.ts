import { Inject, Injectable, Logger } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import BillingRepository from '../../domain/repositories/billing.repository';
import { ExportReceiptsZipCommand } from '../commands/export-receipts-zip.command';
import { NoReceiptsFoundException } from '../exceptions/no-receipts-found.exception';
import { ReceiptPdfService } from '../../infrastructure/services/receipt-pdf.service';

const escapeCsvField = (value: unknown): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r') ||
    str.includes(';')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

export interface ExportReceiptsZipResult {
  zipStream: ZipArchive;
  filename: string;
  count: number;
}

@Injectable()
export class ExportReceiptsZipUseCase {
  private readonly logger = new Logger(ExportReceiptsZipUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.BillingRepository)
    private readonly billingRepository: BillingRepository,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
    private readonly receiptPdfService: ReceiptPdfService,
  ) {}

  async execute(
    command: ExportReceiptsZipCommand,
  ): Promise<ExportReceiptsZipResult> {
    const condominiumName =
      (await this.billingRepository.getCondominiumName(command.condominiumId)) ||
      'Condominio';

    const billingData = await this.billingRepository.getRecordsByPeriod(
      command.condominiumId,
      {
        period: command.period,
        status: 'PAID',
        tower: command.tower,
      },
    );

    const paidRecords = billingData.records.filter(
      (r) => r.status === 'PAID' || (r.paidAmount !== null && r.paidAmount > 0),
    );

    if (!paidRecords || paidRecords.length === 0) {
      throw new NoReceiptsFoundException(
        `No se encontraron recibos o pagos registrados para el periodo ${command.period}.`,
      );
    }

    const zip = new ZipArchive({ zlib: { level: 9 } });

    zip.on('error', (err) => {
      this.logger.error(`Error en streaming del archivo ZIP: ${err.message}`, err.stack);
    });

    const csvLines: string[] = [
      [
        'FOLIO',
        'VIVIENDA',
        'TORRE',
        'TITULAR',
        'CORREO',
        'CONCEPTO',
        'PERIODO',
        'IMPORTE_BASE',
        'RECARGO',
        'TOTAL_PAGADO',
        'FECHA_PAGO',
        'METODO_PAGO',
        'REFERENCIA',
        'ORIGEN_RECIBO',
      ]
        .map(escapeCsvField)
        .join(','),
    ];

    for (const record of paidRecords) {
      let folderName = record.tower
        ? `Casa ${record.houseNumber} - ${record.tower}`
        : record.houseNumber.startsWith('Casa') ||
            record.houseNumber.startsWith('Depto')
          ? record.houseNumber
          : `Casa ${record.houseNumber}`;

      folderName = folderName.replace(/[\\/:*?"<>|]/g, '_').trim();

      const folio =
        record.receipt?.folio ||
        `REC-${record.period}-${record.houseNumber.replace(/\s+/g, '')}`;

      const paymentDate = record.paidDate
        ? new Date(record.paidDate)
        : new Date();

      const paymentDateStr = paymentDate.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      let receiptSource = 'DIGITAL_GENERADO';

      if (record.receipt?.receiptUrl) {
        try {
          const buffer = await this.storageService.getFileBuffer(
            record.receipt.receiptUrl,
          );

          if (buffer && buffer.length > 0) {
            const rawExt =
              record.receipt.fileName?.split('.').pop()?.toLowerCase() || 'pdf';
            const cleanExt = ['pdf', 'png', 'jpg', 'jpeg'].includes(rawExt)
              ? rawExt
              : 'pdf';
            const fileName = `Recibo_${folio}.${cleanExt}`;

            zip.append(buffer, { name: `${folderName}/${fileName}` });
            receiptSource = 'ADJUNTO_OFICIAL';
          } else {
            // Buffer vacío o no encontrado en S3, generar PDF oficial
            const pdfBuffer = await this.receiptPdfService.generateReceiptPdf({
              condominiumName,
              folio,
              houseNumber: record.houseNumber,
              tower: record.tower,
              residentName: record.residentName || 'Residente Registrado',
              residentEmail: record.residentEmail,
              paymentDate,
              paymentMethod: record.paymentMethod,
              transactionReference: record.transactionReference,
              concept: record.concept || 'Cuota Ordinaria de Mantenimiento',
              period: record.period,
              baseAmount: record.baseAmount,
              lateFeeAmount: record.lateFeeAmount,
              totalAmount: record.paidAmount || record.totalAmount,
              notes: record.notes,
            });

            zip.append(pdfBuffer, { name: `${folderName}/Recibo_${folio}.pdf` });
          }
        } catch (err: any) {
          this.logger.warn(
            `No se pudo leer archivo de S3 para ${record.houseNumber}, generando PDF oficial: ${err.message}`,
          );

          const pdfBuffer = await this.receiptPdfService.generateReceiptPdf({
            condominiumName,
            folio,
            houseNumber: record.houseNumber,
            tower: record.tower,
            residentName: record.residentName || 'Residente Registrado',
            residentEmail: record.residentEmail,
            paymentDate,
            paymentMethod: record.paymentMethod,
            transactionReference: record.transactionReference,
            concept: record.concept || 'Cuota Ordinaria de Mantenimiento',
            period: record.period,
            baseAmount: record.baseAmount,
            lateFeeAmount: record.lateFeeAmount,
            totalAmount: record.paidAmount || record.totalAmount,
            notes: record.notes,
          });

          zip.append(pdfBuffer, { name: `${folderName}/Recibo_${folio}.pdf` });
        }
      } else {
        // No tiene archivo en S3 -> Generar PDF oficial vectorial
        const pdfBuffer = await this.receiptPdfService.generateReceiptPdf({
          condominiumName,
          folio,
          houseNumber: record.houseNumber,
          tower: record.tower,
          residentName: record.residentName || 'Residente Registrado',
          residentEmail: record.residentEmail,
          paymentDate,
          paymentMethod: record.paymentMethod,
          transactionReference: record.transactionReference,
          concept: record.concept || 'Cuota Ordinaria de Mantenimiento',
          period: record.period,
          baseAmount: record.baseAmount,
          lateFeeAmount: record.lateFeeAmount,
          totalAmount: record.paidAmount || record.totalAmount,
          notes: record.notes,
        });

        zip.append(pdfBuffer, { name: `${folderName}/Recibo_${folio}.pdf` });
      }

      csvLines.push(
        [
          folio,
          record.houseNumber,
          record.tower || '',
          record.residentName || 'Residente',
          record.residentEmail || '',
          record.concept || 'Cuota Ordinaria de Mantenimiento',
          record.period,
          record.baseAmount,
          record.lateFeeAmount,
          record.paidAmount || record.totalAmount,
          paymentDateStr,
          record.paymentMethod || 'TRANSFER',
          record.transactionReference || '',
          receiptSource,
        ]
          .map(escapeCsvField)
          .join(','),
      );
    }

    // Agregar resumen en formato CSV dentro de la raíz del ZIP (con UTF-8 BOM para Excel)
    const UTF8_BOM = '\uFEFF';
    zip.append(UTF8_BOM + csvLines.join('\r\n'), {
      name: `Resumen_Recibos_${command.period}.csv`,
    });

    // Finalizar empaquetado del archivo ZIP
    zip.finalize();

    const safeCondoName = condominiumName
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .trim();

    const filename = `Recibos_${safeCondoName}_${command.period}.zip`;

    return {
      zipStream: zip,
      filename,
      count: paidRecords.length,
    };
  }
}
