import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { SurveyResponse } from '../dtos/responses/survey.response';
import { SurveyResultsResponse } from '../dtos/responses/survey-results.response';
import { ResidentSurveyStatusResponse } from '../dtos/responses/resident-survey-status.response';

export const createSurvey: ApiEndpointProps = {
  summary: 'Crear una nueva encuesta o votación (Admin)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: SurveyResponse,
  type: SurveyResponse,
};

export const getSurveys: ApiEndpointProps = {
  summary: 'Listar todas las encuestas del condominio con filtros (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  type: [SurveyResponse],
};

export const getSurveyById: ApiEndpointProps = {
  summary: 'Obtener detalle de una encuesta por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: SurveyResponse,
  type: SurveyResponse,
};

export const updateSurvey: ApiEndpointProps = {
  summary: 'Actualizar configuración o datos de una encuesta (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: SurveyResponse,
  type: SurveyResponse,
};

export const changeSurveyStatus: ApiEndpointProps = {
  summary: 'Cambiar estado de la encuesta (DRAFT, ACTIVE, CLOSED, ARCHIVED)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: SurveyResponse,
  type: SurveyResponse,
};

export const archiveSurvey: ApiEndpointProps = {
  summary: 'Archivar una encuesta (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: SurveyResponse,
  type: SurveyResponse,
};

export const deleteSurvey: ApiEndpointProps = {
  summary: 'Eliminar una encuesta (solo si no tiene votos registrados)',
  status: HttpStatus.OK,
  withToken: true,
};

export const getSurveyResults: ApiEndpointProps = {
  summary: 'Obtener resultados y estadísticas con gráficos de una encuesta',
  status: HttpStatus.OK,
  withToken: true,
  serialization: SurveyResultsResponse,
  type: SurveyResultsResponse,
};

export const submitSurveyVote: ApiEndpointProps = {
  summary: 'Emitir voto o respuesta en una encuesta (Residente)',
  status: HttpStatus.CREATED,
  withToken: true,
};

export const getResidentSurveys: ApiEndpointProps = {
  summary: 'Listar encuestas disponibles para el residente actual',
  status: HttpStatus.OK,
  withToken: true,
  type: [SurveyResponse],
};

export const getResidentSurveyStatus: ApiEndpointProps = {
  summary:
    'Consultar estado de participación de la casa/residente en una encuesta',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ResidentSurveyStatusResponse,
  type: ResidentSurveyStatusResponse,
};

export const sendSurveyReminder: ApiEndpointProps = {
  summary:
    'Enviar recordatorio Push a las unidades o residentes que aún no han votado (Admin)',
  status: HttpStatus.OK,
  withToken: true,
};

