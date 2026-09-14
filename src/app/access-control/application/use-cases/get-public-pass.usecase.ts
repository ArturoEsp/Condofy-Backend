import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import { AccessAuthorizationNotFoundException } from '../exceptions/access-authorization-not-found.exception';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';

export class GetPublicPassUseCase {
  constructor(
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(identifier: string): Promise<AccessAuthorizationEntity> {
    const pass =
      await this.accessAuthorizationsRepository.findOneByIdOrIdentifier(
        identifier,
      );

    if (!pass) {
      throw new AccessAuthorizationNotFoundException(
        'El pase de acceso no existe o no fue encontrado.',
      );
    }

    return pass;
  }
}
