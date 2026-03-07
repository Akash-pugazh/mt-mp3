declare class AppError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status?: number, details?: any);
}
export { AppError };
