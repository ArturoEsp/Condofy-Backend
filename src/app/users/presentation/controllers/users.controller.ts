import { Body, Controller, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  /* constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() data: CreateUserRequest) {
    return await this.createUserUseCase.execute(data);
  } */
}
