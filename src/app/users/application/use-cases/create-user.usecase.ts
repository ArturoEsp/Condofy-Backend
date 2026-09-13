import UsersRepository from '../../domain/repositories/users.repository';
import { CreateUserCommand } from '../commands/create-user.command';
import { EmailExistException } from '../errors/email-exist.exception';
import { EncryptionService } from '@/core/domain/services/encryption.service';

export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(data: CreateUserCommand) {
    const { password, ...rest } = data;
    const existEmail = await this.usersRepository.findOneByEmail(data.email);

    if (existEmail) throw new EmailExistException();

    const passwordHash = await this.encryptionService.hash(password);

    return await this.usersRepository.create({
      ...rest,
      passwordHash,
    });
  }
}
