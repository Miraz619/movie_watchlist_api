export interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}