import * as bcrypt from 'bcrypt';
import { EncryptionService } from '@/core/domain/services/encryptation.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptEncryptionService implements EncryptionService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
