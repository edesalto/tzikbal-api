import {
  API_COMMON_MESSAGES,
  API_COMMON_STATUS_CODES,
} from '../enums/api-response.enum';

export class ApiResponse<T> {
  error: boolean;
  statusCode: number;
  timestamp: string;
  message: string;
  data: T;

  constructor(
    data: T,
    message = API_COMMON_MESSAGES.SUCCESS,
    statusCode = API_COMMON_STATUS_CODES.SUCCESS,
    error = false,
  ) {
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.message = message;
    this.data = data;
  }
}
