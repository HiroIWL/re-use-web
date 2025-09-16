import { NextResponse } from "next/server";
import { ApiResponse, ApiError } from "./types";

export class ApiResponseBuilder {
  static success<T>(
    data: T,
    message?: string,
    status: number = 200
  ): NextResponse {
    const response: ApiResponse<T> = {
      message: message || "Operação realizada com sucesso",
      data,
    };

    if (Array.isArray(data)) {
      response.total = data.length;
    }

    return NextResponse.json(response, { status });
  }

  static error(error: string | ApiError, status?: number): NextResponse {
    if (typeof error === "string") {
      return NextResponse.json({ error }, { status: status || 500 });
    }

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  static validationError(field: string, message: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        field,
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  static unauthorized(
    message: string = "Token não fornecido ou inválido"
  ): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  static notFound(resource: string = "Recurso"): NextResponse {
    return NextResponse.json(
      {
        error: `${resource} não encontrado`,
        code: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  static conflict(message: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: "CONFLICT",
      },
      { status: 409 }
    );
  }

  static internalError(
    message: string = "Erro interno do servidor"
  ): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
