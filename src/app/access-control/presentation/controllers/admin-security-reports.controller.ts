import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetSecurityReportUseCase } from '../../application/use-cases/get-security-report.usecase';
import { GetSecurityReportRequest } from '../dtos/requests/get-security-report.request';
import * as Docs from '../docs/admin-security-reports.docs';

@ApiTags('Admin Security Reports')
@Controller(':condominiumKey/security/reports')
@Roles('ADMIN', 'SUPERADMIN')
export class AdminSecurityReportsController {
  constructor(
    private readonly getSecurityReportUseCase: GetSecurityReportUseCase,
  ) {}

  @Get()
  @ApiEndpoint(Docs.getSecurityReport)
  async getReport(
    @CondominiumId() condominiumId: string,
    @Query() query: GetSecurityReportRequest,
  ) {
    return await this.getSecurityReportUseCase.execute({
      condominiumId,
      startDate: query.startDate,
      endDate: query.endDate,
      type: query.type,
      houseId: query.houseId,
      search: query.search,
    });
  }

  @Get('export')
  @ApiEndpoint(Docs.exportSecurityReportCsv)
  async exportCsv(
    @CondominiumId() condominiumId: string,
    @Query() query: GetSecurityReportRequest,
    @Res() res: Response,
  ) {
    const data = await this.getSecurityReportUseCase.execute({
      condominiumId,
      startDate: query.startDate,
      endDate: query.endDate,
      type: query.type,
      houseId: query.houseId,
      search: query.search,
    });

    const csvContent = this.getSecurityReportUseCase.generateCsv(data);

    const safeCondoName = (data.condominiumName || 'Condominio').replace(
      /[^a-zA-Z0-9_-]/g,
      '_',
    );
    const filename = `Reporte_Caseta_${safeCondoName}_${data.startDate}_al_${data.endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.status(200).send(csvContent);
  }
}
