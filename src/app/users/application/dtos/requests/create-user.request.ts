import { IsString } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
