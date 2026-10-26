import { Injectable, Logger } from '@nestjs/common';
import PDFKitInstance = require('pdfkit');

// Soporte universal para constructor de PDFDocument tanto en CJS como en ESM
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDocument: typeof PDFKitInstance =
  (PDFKitInstance as any).default || PDFKitInstance;

export interface ReceiptPdfData {
  condominiumName: string;
  folio: string;
  houseNumber: string;
  tower?: string | null;
  residentName: string;
  residentEmail?: string | null;
  paymentDate: Date;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  concept: string;
  period: string;
  baseAmount: number;
  lateFeeAmount: number;
  totalAmount: number;
  notes?: string | null;
}

@Injectable()
export class ReceiptPdfService {
  private readonly logger = new Logger(ReceiptPdfService.name);

  async generateReceiptPdf(data: ReceiptPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 45,
          info: {
            Title: `Recibo Oficial - ${data.folio}`,
            Author: 'Condofy Platform',
            Subject: `Recibo de pago ${data.period}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const pageWidth = 595.28;
        const margin = 45;
        const contentWidth = pageWidth - margin * 2; // 505.28

        // 1. Barra de acento superior azul Condofy
        doc.rect(margin, margin, contentWidth, 5).fill('#2563EB');

        let currentY = margin + 20;

        // 2. Cabecera Institucional
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .fillColor('#0F172A')
          .text(data.condominiumName, margin, currentY, { width: 320 });

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#64748B')
          .text('Administración y Tesorería Condominal', margin, currentY + 22);

        // Badge "PAGADO" en la esquina superior derecha
        const badgeX = margin + contentWidth - 140;
        doc
          .roundedRect(badgeX, currentY, 140, 24, 6)
          .fillAndStroke('#DCFCE7', '#86EFAC');

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#15803D')
          .text('✓ PAGADO', badgeX, currentY + 7, {
            width: 140,
            align: 'center',
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#334155')
          .text(data.folio, badgeX, currentY + 30, {
            width: 140,
            align: 'center',
          });

        currentY += 58;

        // Línea divisoria
        doc
          .moveTo(margin, currentY)
          .lineTo(margin + contentWidth, currentY)
          .strokeColor('#E2E8F0')
          .lineWidth(1)
          .stroke();

        currentY += 15;

        // 3. Ficha de datos de Vivienda y Pago (Card fondo claro)
        const cardHeight = 72;
        doc
          .roundedRect(margin, currentY, contentWidth, cardHeight, 8)
          .fillAndStroke('#F8FAFC', '#E2E8F0');

        const colWidth = (contentWidth - 30) / 3;
        const col1X = margin + 12;
        const col2X = col1X + colWidth;
        const col3X = col2X + colWidth;
        const cardTextY = currentY + 12;

        // Columna 1: Vivienda
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94A3B8')
          .text('VIVIENDA / INMUEBLE', col1X, cardTextY);

        const houseDisplay =
          data.houseNumber.startsWith('Casa') ||
          data.houseNumber.startsWith('Depto')
            ? data.houseNumber
            : `Casa ${data.houseNumber}`;

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#0F172A')
          .text(houseDisplay, col1X, cardTextY + 13);

        if (data.tower) {
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#64748B')
            .text(data.tower, col1X, cardTextY + 28);
        }

        // Columna 2: Titular / Residente
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94A3B8')
          .text('TITULAR / HABITANTE', col2X, cardTextY);

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#0F172A')
          .text(
            data.residentName || 'Residente Registrado',
            col2X,
            cardTextY + 13,
            {
              width: colWidth - 10,
              lineBreak: false,
              ellipsis: true,
            },
          );

        if (data.residentEmail) {
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#64748B')
            .text(data.residentEmail, col2X, cardTextY + 28, {
              width: colWidth - 10,
              lineBreak: false,
              ellipsis: true,
            });
        }

        // Columna 3: Fecha de Pago y Método
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94A3B8')
          .text('FECHA DE APLICACIÓN', col3X, cardTextY);

        const paymentDateStr = data.paymentDate
          ? new Date(data.paymentDate).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : new Date().toLocaleDateString('es-MX');

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0F172A')
          .text(paymentDateStr, col3X, cardTextY + 13);

        const methodLabel =
          data.paymentMethod === 'TRANSFER'
            ? 'SPEI / Transferencia'
            : data.paymentMethod === 'CASH'
              ? 'Efectivo'
              : data.paymentMethod === 'CARD'
                ? 'Tarjeta'
                : 'Bancario';

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#64748B')
          .text(`Método: ${methodLabel}`, col3X, cardTextY + 28);

        currentY += cardHeight + 20;

        // 4. Detalle Financiero (Tabla)
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#64748B')
          .text('DESGLOSE DE CONCEPTOS LIQUIDADOS', margin, currentY);

        currentY += 15;

        // Encabezado de tabla
        const tableY = currentY;
        const rowHeight = 28;
        doc
          .rect(margin, tableY, contentWidth, rowHeight)
          .fillAndStroke('#F1F5F9', '#E2E8F0');

        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#475569')
          .text('CONCEPTO', margin + 12, tableY + 10, { width: 270 })
          .text('PERIODO', margin + 290, tableY + 10, {
            width: 80,
            align: 'center',
          })
          .text('IMPORTE', margin + 380, tableY + 10, {
            width: 110,
            align: 'right',
          });

        currentY += rowHeight;

        // Fila 1: Cuota Ordinaria
        doc
          .rect(margin, currentY, contentWidth, rowHeight)
          .fillAndStroke('#FFFFFF', '#E2E8F0');

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0F172A')
          .text(
            data.concept || 'Cuota Ordinaria de Mantenimiento',
            margin + 12,
            currentY + 6,
            { width: 270 },
          );

        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor('#94A3B8')
          .text(
            'Servicios comunes, seguridad, recolección y amenidades',
            margin + 12,
            currentY + 16,
          );

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#475569')
          .text(data.period, margin + 290, currentY + 9, {
            width: 80,
            align: 'center',
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0F172A')
          .text(
            `$${Number(data.baseAmount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`,
            margin + 380,
            currentY + 9,
            { width: 110, align: 'right' },
          );

        currentY += rowHeight;

        // Fila 2: Recargo si aplica
        if (data.lateFeeAmount > 0) {
          doc
            .rect(margin, currentY, contentWidth, rowHeight)
            .fillAndStroke('#FFF7ED', '#FED7AA');

          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor('#9A3412')
            .text(
              'Recargo Administrativo por Extemporaneidad',
              margin + 12,
              currentY + 6,
              {
                width: 270,
              },
            );

          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor('#EA580C')
            .text(
              'Aplicado tras vencer la fecha límite',
              margin + 12,
              currentY + 16,
            );

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#9A3412')
            .text('-', margin + 290, currentY + 9, {
              width: 80,
              align: 'center',
            });

          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#9A3412')
            .text(
              `+$${Number(data.lateFeeAmount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`,
              margin + 380,
              currentY + 9,
              { width: 110, align: 'right' },
            );

          currentY += rowHeight;
        }

        // Fila de Total
        const totalRowHeight = 36;
        doc
          .rect(margin, currentY, contentWidth, totalRowHeight)
          .fillAndStroke('#F8FAFC', '#CBD5E1');

        const referenceLabel = data.transactionReference
          ? `Referencia: ${data.transactionReference}`
          : 'Registro y validación interna';

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#64748B')
          .text(referenceLabel, margin + 12, currentY + 13);

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#0F172A')
          .text('Total Liquidado:', margin + 250, currentY + 12, {
            width: 120,
            align: 'right',
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor('#2563EB')
          .text(
            `$${Number(data.totalAmount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`,
            margin + 380,
            currentY + 10,
            { width: 110, align: 'right' },
          );

        currentY += totalRowHeight + 20;

        // Notas de administración si existen
        if (data.notes) {
          doc
            .roundedRect(margin, currentY, contentWidth, 34, 6)
            .fillAndStroke('#F8FAFC', '#E2E8F0');

          doc
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#64748B')
            .text('Observaciones:', margin + 10, currentY + 7);

          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#334155')
            .text(data.notes, margin + 10, currentY + 18, {
              width: contentWidth - 20,
              lineBreak: false,
              ellipsis: true,
            });

          currentY += 46;
        }

        // 5. Pie de Página Oficial
        const footerY = 740;
        doc
          .moveTo(margin, footerY)
          .lineTo(margin + contentWidth, footerY)
          .strokeColor('#E2E8F0')
          .lineWidth(1)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#94A3B8')
          .text(
            'Emitido digitalmente por Condofy Platform • Comprobante con validez administrativa interna',
            margin,
            footerY + 10,
            { align: 'center', width: contentWidth },
          );

        const nowFormatted = new Date().toLocaleString('es-MX', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#CBD5E1')
          .text(
            `Generado el ${nowFormatted} • ${data.folio}`,
            margin,
            footerY + 24,
            { align: 'center', width: contentWidth },
          );

        doc.end();
      } catch (err) {
        this.logger.error(`Error generando PDF de recibo: ${err}`);
        reject(err);
      }
    });
  }
}
