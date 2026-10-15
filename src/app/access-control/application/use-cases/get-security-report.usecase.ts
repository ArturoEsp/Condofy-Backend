import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

export interface GetSecurityReportParams {
  condominiumId: string;
  startDate?: string;
  endDate?: string;
  type?: 'ALL' | 'VISITS' | 'PARCELS' | 'PROVIDERS';
  houseId?: string;
  search?: string;
}

export interface SecurityReportLogItem {
  id: string;
  module: 'VISIT' | 'PARCEL' | 'PROVIDER';
  eventType: string;
  timestamp: string;
  formattedDate: string;
  houseNumber: string;
  personName: string;
  category: string;
  vehiclePlate: string;
  guardName: string;
  status: string;
  comments: string;
}

export interface SecurityReportData {
  condominiumId: string;
  condominiumName: string;
  startDate: string;
  endDate: string;
  totalLogs: number;
  totalVisits: number;
  totalParcels: number;
  totalProviders: number;
  items: SecurityReportLogItem[];
}

const UTF8_BOM = '\uFEFF';

const VISITOR_CATEGORY_LABELS: Record<string, string> = {
  FAMILY: 'Familiar',
  FRIEND: 'Amigo',
  DELIVERY: 'Repartidor / Mensajería',
  SERVICE: 'Servicio / Técnico',
  CONTRACTOR: 'Contratista',
  EVENT_GUEST: 'Invitado a Evento',
  TAXI: 'Taxi / Transporte',
  OTHER: 'Otro',
};

const PROVIDER_CATEGORY_LABELS: Record<string, string> = {
  WATER: 'Agua / Pipas',
  GAS: 'Gas',
  ELECTRICITY: 'Luz / CFE',
  TELECOM: 'Internet / Telefonía',
  MAINTENANCE: 'Mantenimiento',
  GARDENING: 'Jardinería',
  CLEANING: 'Limpieza',
  GOVERNMENT: 'Servicios Públicos',
  OTHER: 'Otro',
};

const COURIER_LABELS: Record<string, string> = {
  AMAZON: 'Amazon',
  MERCADO_LIBRE: 'Mercado Libre',
  DHL: 'DHL',
  FEDEX: 'FedEx',
  ESTAFETA: 'Estafeta',
  UBER_EATS: 'Uber Eats',
  RAPPI: 'Rappi',
  DIDI_FOOD: 'DiDi Food',
  POST_OFFICE: 'Correos de México',
  OTHER: 'Otra Mensajería',
};

@Injectable()
export class GetSecurityReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  private formatGuardName(
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null,
  ): string {
    if (!user) return 'No registrado';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Guardia de caseta';
  }

  private escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  async execute(params: GetSecurityReportParams): Promise<SecurityReportData> {
    const condominium = await this.prisma.condominium.findUnique({
      where: { id: params.condominiumId },
      select: { id: true, name: true },
    });

    if (!condominium) {
      throw new NotFoundException('Condominio no encontrado');
    }

    const now = new Date();
    const todayYmd = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    const startYmd = params.startDate || `${todayYmd.slice(0, 8)}01`;
    const endYmd = params.endDate || todayYmd;

    // Cubrimos el día completo en UTC tomando en cuenta desfases horarios
    const windowStart = new Date(`${startYmd}T00:00:00.000Z`);
    const windowEnd = new Date(`${endYmd}T23:59:59.999Z`);

    const typeFilter = params.type || 'ALL';
    const rawItems: SecurityReportLogItem[] = [];

    let totalVisits = 0;
    let totalParcels = 0;
    let totalProviders = 0;

    // 1. Visitas y Accesos (AccessLog)
    if (typeFilter === 'ALL' || typeFilter === 'VISITS') {
      const accessLogs = await this.prisma.accessLog.findMany({
        where: {
          date: {
            gte: windowStart,
            lte: windowEnd,
          },
          authorization: {
            visitor: {
              house: {
                condominiumId: params.condominiumId,
                ...(params.houseId ? { id: params.houseId } : {}),
              },
            },
          },
        },
        include: {
          userAccept: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          authorization: {
            include: {
              visitor: {
                include: {
                  house: { select: { id: true, houseNumber: true } },
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      totalVisits = accessLogs.length;

      for (const log of accessLogs) {
        const visitor = log.authorization?.visitor;
        const house = visitor?.house;
        const visitorName =
          `${visitor?.firstName || ''} ${visitor?.lastName || ''}`.trim() ||
          'Visitante';
        const houseStr = house?.houseNumber
          ? `Casa ${house.houseNumber}`
          : 'Sin vivienda asignada';
        const plate =
          log.authorization?.vehiclePlate ||
          visitor?.vehiclePlate ||
          'N/A - Peatonal';
        const categoryLabel =
          VISITOR_CATEGORY_LABELS[visitor?.category || ''] ||
          visitor?.category ||
          'Visita';
        const guardName = this.formatGuardName(log.userAccept);

        const notesParts: string[] = [];
        if (log.authorization?.notes) {
          notesParts.push(`Autorización: ${log.authorization.notes.trim()}`);
        }
        if (log.observations) {
          notesParts.push(`Caseta: ${log.observations.trim()}`);
        }
        const comments =
          notesParts.length > 0
            ? notesParts.join(' | ')
            : 'Sin comentarios registrados';

        rawItems.push({
          id: log.id,
          module: 'VISIT',
          eventType:
            log.entryType === 'ENTRY'
              ? 'Entrada de Visita'
              : 'Salida de Visita',
          timestamp: log.date.toISOString(),
          formattedDate: this.formatDateTime(log.date),
          houseNumber: houseStr,
          personName: visitorName,
          category: categoryLabel,
          vehiclePlate: plate,
          guardName,
          status:
            log.entryType === 'ENTRY'
              ? 'Acceso Autorizado'
              : 'Salida Registrada',
          comments,
        });
      }
    }

    // 2. Paquetería (ParcelDelivery)
    if (typeFilter === 'ALL' || typeFilter === 'PARCELS') {
      const parcels = await this.prisma.parcelDelivery.findMany({
        where: {
          condominiumId: params.condominiumId,
          ...(params.houseId ? { houseId: params.houseId } : {}),
          OR: [
            { receivedAt: { gte: windowStart, lte: windowEnd } },
            { deliveredAt: { gte: windowStart, lte: windowEnd } },
          ],
        },
        include: {
          house: { select: { id: true, houseNumber: true } },
          receivedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          deliveredBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { receivedAt: 'desc' },
      });

      totalParcels = parcels.length;

      for (const p of parcels) {
        const houseStr = p.house?.houseNumber
          ? `Casa ${p.house.houseNumber}`
          : 'Sin vivienda';
        const courierName =
          p.customCourier ||
          COURIER_LABELS[p.courier] ||
          p.courier ||
          'Paquetería';
        const courierDetail = p.trackingNumber
          ? `${courierName} (Guía: ${p.trackingNumber})`
          : courierName;
        const guardReceived = this.formatGuardName(p.receivedBy);
        const guardDelivered = p.deliveredBy
          ? this.formatGuardName(p.deliveredBy)
          : null;

        const isDelivered = p.status === 'DELIVERED';
        const statusLabel = isDelivered
          ? 'Entregado al Residente'
          : p.status === 'IN_CUSTODY'
            ? 'En Custodia en Caseta'
            : 'Devuelto a Mensajería';

        const commentsParts: string[] = [];
        commentsParts.push(`PIN Entrega: ${p.pickupCode}`);
        if (p.notes) {
          commentsParts.push(`Recepción: ${p.notes.trim()}`);
        }
        if (p.deliveryNotes) {
          commentsParts.push(`Entrega: ${p.deliveryNotes.trim()}`);
        }
        if (isDelivered && p.deliveredToName) {
          commentsParts.push(`Recogió: ${p.deliveredToName.trim()}`);
        }
        const comments = commentsParts.join(' | ');

        let guardStr = `Recibió: ${guardReceived}`;
        if (guardDelivered) {
          guardStr += ` | Entregó: ${guardDelivered}`;
        }

        rawItems.push({
          id: p.id,
          module: 'PARCEL',
          eventType: isDelivered
            ? 'Paquetería Entregada'
            : 'Paquetería Recibida',
          timestamp: p.receivedAt.toISOString(),
          formattedDate: this.formatDateTime(p.receivedAt),
          houseNumber: houseStr,
          personName: courierDetail,
          category: `${p.packageCount} paquete(s)`,
          vehiclePlate: 'N/A',
          guardName: guardStr,
          status: statusLabel,
          comments,
        });
      }
    }

    // 3. Proveedores Generales de Caseta (GeneralProviderAccess)
    if (
      (typeFilter === 'ALL' || typeFilter === 'PROVIDERS') &&
      !params.houseId
    ) {
      const providers = await this.prisma.generalProviderAccess.findMany({
        where: {
          condominiumId: params.condominiumId,
          enteredAt: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        include: {
          entryGuard: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          exitGuard: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { enteredAt: 'desc' },
      });

      totalProviders = providers.length;

      for (const prov of providers) {
        const categoryLabel =
          PROVIDER_CATEGORY_LABELS[prov.category] || prov.category;
        const driver = prov.driverName ? ` (Chofer: ${prov.driverName})` : '';
        const providerName = `${prov.name}${driver}`;
        const guardEntry = this.formatGuardName(prov.entryGuard);
        const guardExit = prov.exitGuard
          ? this.formatGuardName(prov.exitGuard)
          : null;

        const isInside = prov.status === 'INSIDE';
        const commentsParts: string[] = [];
        if (prov.notes) {
          commentsParts.push(`Entrada: ${prov.notes.trim()}`);
        }
        if (prov.exitNotes) {
          commentsParts.push(`Salida: ${prov.exitNotes.trim()}`);
        }
        const comments =
          commentsParts.length > 0
            ? commentsParts.join(' | ')
            : 'Sin comentarios registrados';

        let guardStr = `Entrada: ${guardEntry}`;
        if (guardExit) {
          guardStr += ` | Salida: ${guardExit}`;
        }

        rawItems.push({
          id: prov.id,
          module: 'PROVIDER',
          eventType: isInside ? 'Proveedor Dentro' : 'Proveedor Salida',
          timestamp: prov.enteredAt.toISOString(),
          formattedDate: this.formatDateTime(prov.enteredAt),
          houseNumber: 'Servicio General / Fraccionamiento',
          personName: providerName,
          category: categoryLabel,
          vehiclePlate: prov.vehiclePlate || 'N/A',
          guardName: guardStr,
          status: isInside
            ? 'Dentro de las instalaciones'
            : 'Salida completada',
          comments,
        });
      }
    }

    // Ordenar cronológicamente descendente (más recientes primero)
    rawItems.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Filtrar por término de búsqueda si se proporciona
    let filteredItems = rawItems;
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filteredItems = rawItems.filter(
        (i) =>
          i.personName.toLowerCase().includes(q) ||
          i.houseNumber.toLowerCase().includes(q) ||
          i.guardName.toLowerCase().includes(q) ||
          i.vehiclePlate.toLowerCase().includes(q) ||
          i.comments.toLowerCase().includes(q) ||
          i.eventType.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q),
      );
    }

    return {
      condominiumId: condominium.id,
      condominiumName: condominium.name,
      startDate: startYmd,
      endDate: endYmd,
      totalLogs: filteredItems.length,
      totalVisits,
      totalParcels,
      totalProviders,
      items: filteredItems,
    };
  }

  generateCsv(data: SecurityReportData): string {
    const headers = [
      'Fecha y Hora',
      'Tipo de Registro',
      'Vivienda / Destino',
      'Visitante / Proveedor / Paquetería',
      'Categoría / Detalle',
      'Vehículo / Placas',
      'Guardia en Caseta',
      'Estatus',
      'Comentarios a Caseta / Observaciones',
    ];

    const rows = data.items.map((item) => [
      this.escapeCsv(item.formattedDate),
      this.escapeCsv(item.eventType),
      this.escapeCsv(item.houseNumber),
      this.escapeCsv(item.personName),
      this.escapeCsv(item.category),
      this.escapeCsv(item.vehiclePlate),
      this.escapeCsv(item.guardName),
      this.escapeCsv(item.status),
      this.escapeCsv(item.comments),
    ]);

    return (
      UTF8_BOM +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    );
  }
}
