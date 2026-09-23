import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { UploadsController } from './presentation/controllers/uploads.controller';

@Module({
  imports: [CoreModule],
  controllers: [UploadsController],
  exports: [CoreModule],
})
export class UploadsModule {}
