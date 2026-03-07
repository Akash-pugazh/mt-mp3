export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: Record<string, unknown> | null;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}
