import UsersRepository from '../../domain/repositories/users.repository';
import { CreateUserCommand } from '../commands/create-user.command';
import { EmailExistException } from '../errors/email-exist.exeception';

export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(data: CreateUserCommand) {
    const { password, ...rest } = data;
    const existEmail = await this.usersRepository.findOneByEmail(data.email);

    if (existEmail) throw new EmailExistException();

    return await this.usersRepository.create({
      ...rest,
      passwordHash: password,
    });
  }
}
