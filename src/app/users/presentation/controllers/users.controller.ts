import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-case/create-user.usecase';
import { CreateUserRequest } from '../../application/dtos/requests/create-user.request';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() data: CreateUserRequest) {
    return await this.createUserUseCase.execute(data);
  }
}
