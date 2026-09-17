import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { AdminUserResponse } from '../dtos/responses/admin-user.response';

export const listAdmins: ApiEndpointProps = {
  summary: 'Listar usuarios administradores del condominio',
  status: HttpStatus.OK,
  withToken: true,
  type: [AdminUserResponse],
};

export const createAdmin: ApiEndpointProps = {
  summary: 'Registrar un nuevo usuario administrador',
  status: HttpStatus.CREATED,
  withToken: true,
};

export const updateAdminStatus: ApiEndpointProps = {
  summary: 'Actualizar el estado (activo/suspendido) de un administrador',
  status: HttpStatus.OK,
  withToken: true,
  type: AdminUserResponse,
};

export const updateAdmin: ApiEndpointProps = {
  summary: 'Actualizar datos básicos de un administrador',
  status: HttpStatus.OK,
  withToken: true,
  type: AdminUserResponse,
};

export const deleteAdmin: ApiEndpointProps = {
  summary: 'Eliminar un administrador del condominio',
  status: HttpStatus.OK,
  withToken: true,
};
