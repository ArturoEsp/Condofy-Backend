import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({
    summary: 'Verifica el estado del servidor y la base de datos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio y base de datos operando con normalidad',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'La base de datos u otro servicio no responde',
  })
  async check(@Res() res: Response) {
    const startTime = Date.now();
    let dbStatus = 'up';
    let dbResponseTimeMs = 0;
    let isHealthy = true;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbResponseTimeMs = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'down';
      isHealthy = false;
    }

    const payload = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: {
          status: dbStatus,
          responseTimeMs: dbResponseTimeMs,
        },
      },
    };

    return res
      .status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(payload);
  }
}
