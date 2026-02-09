/**
 * Validation Utilities
 * 
 * Helper functions for validating and parsing data.
 */

import { z, ZodError, ZodSchema } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Validates data against a Zod schema and returns parsed result or error response.
 */
export function validateRequest<T>(
    schema: ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
    try {
        const parsed = schema.parse(data);
        return { success: true, data: parsed };
    } catch (err) {
        if (err instanceof ZodError) {
            const errors = err.issues.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            }));
            return {
                success: false,
                error: NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: errors
                    },
                    { status: 400 }
                ),
            };
        }
        throw err;
    }
}

/**
 * Validates FormData against a Zod schema.
 * Converts FormData to a plain object first.
 */
export function validateFormData<T>(
    schema: ZodSchema<T>,
    formData: FormData
): { success: true; data: T } | { success: false; error: string } {
    const data: Record<string, unknown> = {};

    formData.forEach((value, key) => {
        // Handle empty strings as null for optional fields
        if (value === '') {
            data[key] = null;
        } else {
            data[key] = value;
        }
    });

    try {
        const parsed = schema.parse(data);
        return { success: true, data: parsed };
    } catch (err) {
        if (err instanceof ZodError) {
            const firstError = err.issues[0];
            return {
                success: false,
                error: `${firstError.path.join('.')}: ${firstError.message}`,
            };
        }
        throw err;
    }
}

/**
 * Standard API error response helper.
 */
export function apiError(
    message: string,
    status: number = 400,
    details?: Record<string, unknown>
): NextResponse {
    return NextResponse.json(
        {
            error: message,
            ...(details && { details }),
        },
        { status }
    );
}

/**
 * Standard API success response helper.
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
}

// Re-export schemas
export * from './schemas';
