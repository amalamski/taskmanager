import { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'A record with this value already exists',
      field: err.message.includes('email') ? 'email' : undefined
    });
    return;
  }

  // Prisma foreign key error
  if (err.code === 'P2003') {
    res.status(400).json({
      error: 'Invalid reference - related record not found'
    });
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found'
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const createError = (message: string, statusCode: number): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
};