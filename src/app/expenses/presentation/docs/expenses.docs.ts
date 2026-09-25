import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { ExpensesListResponse } from '../dtos/responses/expenses-list.response';
import { ExpenseResponse } from '../dtos/responses/expense.response';
import { ExpensesSummaryResponse } from '../dtos/responses/expenses-summary.response';

export const createExpense: ApiEndpointProps = {
  summary: 'Registrar un nuevo gasto operativo del condominio',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ExpenseResponse,
  type: ExpenseResponse,
};

export const getExpenses: ApiEndpointProps = {
  summary: 'Listar gastos operativos del condominio por periodo',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExpensesListResponse,
  type: ExpensesListResponse,
};

export const getExpenseSummary: ApiEndpointProps = {
  summary: 'Obtener resumen ejecutivo y KPIs de egresos del periodo',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExpensesSummaryResponse,
  type: ExpensesSummaryResponse,
};

export const getExpenseById: ApiEndpointProps = {
  summary: 'Obtener detalle de un gasto operativo por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExpenseResponse,
  type: ExpenseResponse,
};

export const updateExpense: ApiEndpointProps = {
  summary: 'Actualizar datos de un gasto operativo',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExpenseResponse,
  type: ExpenseResponse,
};

export const deleteExpense: ApiEndpointProps = {
  summary: 'Eliminar un gasto operativo',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExpenseResponse,
  type: ExpenseResponse,
};

export const exportExpenses: ApiEndpointProps = {
  summary: 'Exportar gastos operativos a CSV',
  status: HttpStatus.OK,
  withToken: true,
};

export const getTransparencySettings: ApiEndpointProps = {
  summary: 'Obtener configuración de transparencia del condominio',
  status: HttpStatus.OK,
  withToken: true,
};

export const updateTransparencySettings: ApiEndpointProps = {
  summary:
    'Actualizar configuración de visibilidad para transparencia de residentes',
  status: HttpStatus.OK,
  withToken: true,
};

export const getTransparencyReport: ApiEndpointProps = {
  summary: 'Obtener portal de transparencia y balance general para residentes',
  status: HttpStatus.OK,
  withToken: true,
};
