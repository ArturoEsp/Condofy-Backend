import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';

export interface ExtractedMovement {
  fecha: string; // YYYY-MM-DD
  concepto: string;
  monto: number;
  tipo: 'abono' | 'cargo';
  referencia?: string;
  numeroCasaSugerido?: string;
}

export interface ExtractedStatementData {
  banco?: string;
  cuenta?: string;
  periodo?: string;
  movimientos: ExtractedMovement[];
}

@Injectable()
export class BankStatementParserService {
  private readonly logger = new Logger(BankStatementParserService.name);

  /**
   * Extrae movimientos bancarios desde un archivo PDF, Excel (.xlsx/.xls) o CSV.
   */
  async parseStatement(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<ExtractedStatementData> {
    const isPdf =
      mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

    const isExcelOrCsv =
      mimeType.includes('spreadsheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('csv') ||
      /\.(xlsx|xls|csv)$/i.test(fileName);

    if (isPdf) {
      return this.parsePdfWithGemini(buffer, fileName);
    } else if (isExcelOrCsv) {
      return this.parseExcelOrCsv(buffer, fileName);
    } else {
      throw new BadRequestException(
        `Formato no soportado (${fileName}). Por favor sube un estado de cuenta en formato PDF, Excel (.xlsx/.xls) o CSV.`,
      );
    }
  }

  /**
   * Extrae movimientos desde PDF usando Google Gemini Flash con Structured Outputs.
   */
  private async parsePdfWithGemini(
    buffer: Buffer,
    fileName: string,
  ): Promise<ExtractedStatementData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu_clave')) {
      throw new BadRequestException(
        'La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor. Por favor agrégala para procesar estados de cuenta en PDF.',
      );
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

      this.logger.log(
        `Iniciando análisis de PDF con Gemini (${modelName}): ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`,
      );

      const ai = new GoogleGenAI({ apiKey });

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          banco: {
            type: Type.STRING,
            description:
              'Nombre del banco emisor (ej. BBVA, Santander, Banorte, Banamex, etc.)',
          },
          cuenta: {
            type: Type.STRING,
            description: 'Número de cuenta o clabe si es visible',
          },
          periodo: {
            type: Type.STRING,
            description: 'Periodo o mes del estado de cuenta (ej. Marzo 2026)',
          },
          movimientos: {
            type: Type.ARRAY,
            description:
              'Lista de todos los movimientos de depósito / abono / transferencia recibida detectados.',
            items: {
              type: Type.OBJECT,
              properties: {
                fecha: {
                  type: Type.STRING,
                  description:
                    'Fecha de la operación en formato ISO YYYY-MM-DD.',
                },
                concepto: {
                  type: Type.STRING,
                  description:
                    'Descripción o concepto completo de la transacción bancaria.',
                },
                monto: {
                  type: Type.NUMBER,
                  description:
                    'Monto del abono/depósito en número positivo (ej. 1500.00).',
                },
                tipo: {
                  type: Type.STRING,
                  enum: ['abono', 'cargo'],
                  description:
                    'abono para depósitos/ingresos, cargo para retiros/gastos',
                },
                referencia: {
                  type: Type.STRING,
                  description:
                    'Número de referencia bancaria, clave de rastreo SPEI o folio si existe.',
                },
                numeroCasaSugerido: {
                  type: Type.STRING,
                  description:
                    'Identificador de casa, departamento, lote o privada si se menciona en el concepto o referencia (ej. "14", "302", "Casa 8", "L-12"). Omitir si no se detecta.',
                },
              },
              required: ['fecha', 'concepto', 'monto', 'tipo'],
            },
          },
        },
        required: ['movimientos'],
      };

      const prompt = `Actúa como un experto contador y auditor de estados de cuenta bancarios en México y Latinoamérica.
Analiza detenidamente la información del estado de cuenta bancario proporcionada.
Extrae prioritariamente TODOS los movimientos de tipo ABONO / DEPÓSITO / TRANSFERENCIA RECIBIDA (ingresos recibidos en la cuenta).
Los pagos de mantenimiento de los condóminos son depósitos y transferencias recibidas.

Reglas críticas:
1. Normaliza cada fecha al formato YYYY-MM-DD. Si solo aparece día y mes (ej. "15 MAR"), infiere el año del periodo del estado de cuenta.
2. El monto debe ser un número positivo, sin signos de moneda ni comas.
3. En el campo "numeroCasaSugerido", busca si en la descripción, concepto o referencia el usuario escribió el número de su casa, depto o lote (ejemplos: "Mantenimiento Casa 45", "C-12", "Depto 204", "Lote 33", "Pago casa 7"). Si no hay ningún número de casa evidente, déjalo vacío.
4. Ignora cargos por comisiones o transferencias salientes (o márcalas con tipo "cargo").`;

      // 1. Intentar extracción instantánea de texto nativo del PDF (< 50ms)
      let extractedPdfText = '';
      try {
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedPdfText = (result?.text || '').trim();
        if (extractedPdfText.length > 50) {
          this.logger.log(
            `Capa de texto digital detectada en PDF (${extractedPdfText.length} caracteres). Enviando como texto directo a Gemini para análisis instantáneo.`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `No se pudo extraer texto nativo directo del PDF (${err?.message}). Se enviará como documento visual.`,
        );
      }

      // Si tiene texto nativo, enviar como texto plano (1 a 3 segundos de respuesta).
      // Si es escaneado/imagen, enviar como inlineData base64.
      const contentsParts =
        extractedPdfText.length > 50
          ? [
              {
                text: `${prompt}\n\n=========================================\nCONTENIDO DEL ESTADO DE CUENTA:\n=========================================\n${extractedPdfText}`,
              },
            ]
          : [
              {
                inlineData: {
                  data: buffer.toString('base64'),
                  mimeType: 'application/pdf',
                },
              },
              {
                text: prompt,
              },
            ];

      const candidateModels = [
        process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-2.5-flash-lite',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      let response: { text?: string } | null = null;
      let lastError: unknown = null;

      for (const model of candidateModels) {
        try {
          this.logger.log(`Consultando modelo Gemini: ${model}...`);

          response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: contentsParts,
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.1,
              thinkingConfig: {
                thinkingBudget: 0, // Desactiva el razonamiento extendido (thinking) para respuesta ultra rápida
              },
            },
          });

          if (response?.text) {
            this.logger.log(
              `Respuesta obtenida con éxito usando modelo: ${model}`,
            );
            break;
          }
        } catch (err) {
          lastError = err;
          const errMsg = (err as Error)?.message || String(err);
          const isOverloaded =
            errMsg.includes('503') ||
            errMsg.includes('high demand') ||
            errMsg.includes('429') ||
            errMsg.includes('UNAVAILABLE') ||
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.includes('is no longer available');

          if (isOverloaded) {
            this.logger.warn(
              `Modelo ${model} no disponible temporalmente (${errMsg}). Intentando con modelo alternativo...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1200));
            continue;
          } else {
            throw err;
          }
        }
      }

      if (!response?.text) {
        throw (
          lastError ||
          new Error('No se recibió respuesta válida de los modelos de Gemini.')
        );
      }

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text) as ExtractedStatementData;

      // Filtrar únicamente abonos / ingresos (monto > 0)
      const abonos = (parsed.movimientos || [])
        .filter((m) => m.tipo === 'abono' && Number(m.monto) > 0)
        .map((m) => ({
          ...m,
          monto: Number(m.monto),
          fecha: this.normalizeDate(m.fecha),
        }));

      this.logger.log(
        `Gemini Flash extrajo ${abonos.length} abonos del estado de cuenta (${parsed.banco || 'Banco no especificado'}).`,
      );

      return {
        banco: parsed.banco,
        cuenta: parsed.cuenta,
        periodo: parsed.periodo,
        movimientos: abonos,
      };
    } catch (error) {
      const err = error as Error;
      const errorMessage = err?.message || String(error);
      this.logger.error(
        `Error procesando estado de cuenta con Gemini: ${errorMessage}`,
        err?.stack,
      );
      throw new BadRequestException(
        `No se pudo extraer la información del estado de cuenta con Gemini Flash: ${errorMessage}`,
      );
    }
  }

  /**
   * Extrae movimientos desde archivo Excel (.xlsx/.xls) o CSV usando la librería xlsx.
   */
  private parseExcelOrCsv(
    buffer: Buffer,
    fileName: string,
  ): ExtractedStatementData {
    try {
      this.logger.log(`Procesando archivo tabular: ${fileName}`);
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      type SheetRow = Record<
        string,
        string | number | boolean | null | undefined
      >;
      const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
        raw: false,
        defval: '',
      });

      if (!rows || rows.length === 0) {
        throw new BadRequestException(
          'La hoja de cálculo está vacía o no tiene datos legibles.',
        );
      }

      // Detectar nombres de columnas comunes en bancos
      const movimientos: ExtractedMovement[] = [];

      for (const row of rows) {
        const keys = Object.keys(row);
        let dateVal = '';
        let conceptVal = '';
        let amountVal = 0;
        let refVal = '';

        for (const key of keys) {
          const lowerKey = key.toLowerCase();
          const val = String(row[key]).trim();

          if (/fecha|date|f\.\s*oper/i.test(lowerKey) && !dateVal) {
            dateVal = val;
          } else if (
            /concepto|descripci[oó]n|detalle|movimiento/i.test(lowerKey) &&
            !conceptVal
          ) {
            conceptVal = val;
          } else if (
            /abono|dep[oó]sito|cr[eé]dito|ingreso/i.test(lowerKey) &&
            amountVal === 0
          ) {
            const parsed = this.cleanAmount(val);
            if (parsed > 0) amountVal = parsed;
          } else if (
            /importe|monto|amount/i.test(lowerKey) &&
            amountVal === 0
          ) {
            const parsed = this.cleanAmount(val);
            if (parsed > 0) amountVal = parsed;
          } else if (
            /referencia|ref|rastreo|folio/i.test(lowerKey) &&
            !refVal
          ) {
            refVal = val;
          }
        }

        if (amountVal > 0 && (conceptVal || refVal)) {
          movimientos.push({
            fecha: this.normalizeDate(dateVal),
            concepto: conceptVal || 'Transferencia / Abono bancario',
            monto: amountVal,
            tipo: 'abono',
            referencia: refVal || undefined,
            numeroCasaSugerido: this.extractHouseFromText(
              conceptVal + ' ' + refVal,
            ),
          });
        }
      }

      return {
        banco: 'Archivo Tabular / Excel',
        movimientos,
      };
    } catch (error) {
      const err = error as Error;
      const errorMessage = err?.message || String(error);
      this.logger.error(`Error procesando archivo Excel/CSV: ${errorMessage}`);
      throw new BadRequestException(
        `Error leyendo el archivo Excel/CSV: ${errorMessage}`,
      );
    }
  }

  private cleanAmount(value: string | number): number {
    if (typeof value === 'number') return Math.abs(value);
    if (!value) return 0;
    const cleanStr = String(value).replace(/[\$,\s]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.abs(num);
  }

  private normalizeDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    // Formato DD/MM/YYYY
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return new Date().toISOString().split('T')[0];
  }

  private extractHouseFromText(text: string): string | undefined {
    if (!text) return undefined;
    // Buscar patrones tipo: "casa 14", "c-14", "c 14", "depto 302", "d-12", "lote 5"
    const match = text.match(
      /(?:casa|c-|c\s+|depto|d-|lote|l-)\s*([a-zA-Z0-9_-]+)/i,
    );
    if (match && match[1]) {
      return match[1];
    }
    return undefined;
  }
}
