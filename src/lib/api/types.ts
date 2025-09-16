import { NextRequest, NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  total?: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface AuthenticatedUser {
  id: number;
  nome: string;
  email: string;
}

export interface QueryParams {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'array';
  min?: number;
  max?: number;
  message?: string;
}

export interface RouteConfig {
  requireAuth?: boolean;
  validations?: ValidationRule[];
  allowedMethods?: string[];
}

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: {
    user?: AuthenticatedUser;
    body?: unknown;
    params?: Record<string, string>;
    query?: QueryParams;
  }
) => Promise<T>;

export type RouteHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> | Record<string, string> }
) => Promise<NextResponse>;
