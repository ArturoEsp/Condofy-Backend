import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { Public } from '@/common/decorators/public.decorator';
import * as Docs from '../docs/public-pass.docs';
import { GetPublicPassUseCase } from '../../application/use-cases/get-public-pass.usecase';

@ApiTags('Public Passes')
@Controller('public/passes')
@Public()
export class PublicPassController {
  constructor(private readonly getPublicPassUseCase: GetPublicPassUseCase) {}

  @Get(':id')
  @Public()
  @ApiEndpoint(Docs.getPublicPass)
  async getPass(@Param('id') id: string) {
    return await this.getPublicPassUseCase.execute(id);
  }
}
