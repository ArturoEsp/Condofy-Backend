import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { UserMeResponse } from '../dto/responses/user-me.response';

export const authGetMe: ApiEndpointProps = {
  summary: 'Obtener información del usuario autenticado',
  status: HttpStatus.OK,
  withToken: true,
  serialization: UserMeResponse,
  type: UserMeResponse,
};

export const authUpdateProfile: ApiEndpointProps = {
  summary: 'Actualizar información básica del perfil del usuario autenticado',
  status: HttpStatus.OK,
  withToken: true,
  serialization: UserMeResponse,
  type: UserMeResponse,
};

export const authChangePassword: ApiEndpointProps = {
  summary: 'Cambiar la contraseña del usuario autenticado',
  status: HttpStatus.OK,
  withToken: true,
};

export const authForgotPassword: ApiEndpointProps = {
  summary: 'Solicitar enlace para restablecer contraseña por correo',
  status: HttpStatus.OK,
  withToken: false,
};

export const authResetPassword: ApiEndpointProps = {
  summary: 'Restablecer contraseña usando token de un solo uso',
  status: HttpStatus.OK,
  withToken: false,
};
