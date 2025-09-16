import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../utils/auth";
import {
  ApiHandler,
  RouteConfig,
  QueryParams,
  AuthenticatedUser,
} from "./types";
import { ApiResponseBuilder } from "./response";
import { ApiValidator } from "./validation";

export function createApiHandler(
  handler: ApiHandler,
  config: RouteConfig = {}
) {
  return async (
    request: NextRequest,
    context?: {
      params?: Promise<Record<string, string>> | Record<string, string>;
    }
  ): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      if (
        config.allowedMethods &&
        !config.allowedMethods.includes(request.method)
      ) {
        return ApiResponseBuilder.error("Método não permitido", 405);
      }

      let user: AuthenticatedUser | undefined;
      if (config.requireAuth !== false) {
        try {
          user = await getAuthenticatedUser(request);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro de autenticação";
          return ApiResponseBuilder.unauthorized(errorMessage);
        }
      }

      let body: unknown;
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        try {
          body = await request.json();
        } catch {
          return ApiResponseBuilder.validationError(
            "body",
            "JSON inválido no corpo da requisição"
          );
        }

        if (
          config.validations &&
          body &&
          typeof body === "object" &&
          body !== null
        ) {
          try {
            ApiValidator.validate(
              body as Record<string, unknown>,
              config.validations
            );
          } catch (validationResponse) {
            return validationResponse as NextResponse;
          }
        }
      }

      const query: QueryParams = {};
      const { searchParams } = new URL(request.url);
      searchParams.forEach((value, key) => {
        query[key] = value;
      });

      const params = context?.params
        ? context.params instanceof Promise
          ? await context.params
          : context.params
        : undefined;

      const result = await handler(request, {
        user,
        body,
        params,
        query,
      });

      if (result instanceof NextResponse) {
        return result;
      }

      return ApiResponseBuilder.success(result);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`${request.method} ${request.url} - ${duration}ms:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (
        errorMessage === "Token não fornecido" ||
        errorMessage === "Token inválido"
      ) {
        return ApiResponseBuilder.unauthorized(errorMessage);
      }

      if (
        errorMessage === "Produto não encontrado" ||
        errorMessage.includes("não encontrado")
      ) {
        return ApiResponseBuilder.notFound(errorMessage);
      }

      if (errorMessage.includes("já existe") || errorMessage.includes("já")) {
        return ApiResponseBuilder.conflict(errorMessage);
      }

      return ApiResponseBuilder.internalError(errorMessage);
    }
  };
}

export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return {
    getString: (key: string, defaultValue?: string): string | undefined => {
      return searchParams.get(key) || defaultValue;
    },

    getNumber: (key: string, defaultValue?: number): number | undefined => {
      const value = searchParams.get(key);
      if (!value) return defaultValue;
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    },

    getInt: (key: string, defaultValue?: number): number | undefined => {
      const value = searchParams.get(key);
      if (!value) return defaultValue;
      const num = parseInt(value);
      return isNaN(num) ? defaultValue : num;
    },

    getBoolean: (key: string, defaultValue?: boolean): boolean | undefined => {
      const value = searchParams.get(key);
      if (!value) return defaultValue;
      return value.toLowerCase() === "true";
    },

    getArray: (key: string, separator: string = ","): string[] => {
      const value = searchParams.get(key);
      return value ? value.split(separator).map((s) => s.trim()) : [];
    },
  };
}
