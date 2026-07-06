// src/lib/api/respond.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors/app-error';

/**
 * Part 2, Section 10's response shape — every route uses these two
 * helpers instead of building NextResponse.json({...}) by hand, so the
 * shape can never drift endpoint-to-endpoint.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  // Never leak raw internal/DB errors to the client (Part 2, Section 17).
  console.error('Unhandled API error', error);
  return NextResponse.json(
    {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
    },
    { status: 500 },
  );
}