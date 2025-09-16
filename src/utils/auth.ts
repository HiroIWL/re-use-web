import { NextRequest } from "next/server";
import { AuthService } from "../services/auth.service";

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token não fornecido");
  }

  const token = authHeader.substring(7);  
  try {
    const usuario = await AuthService.obterUsuarioDoToken(token);
    return usuario;
  } catch {
    throw new Error("Token inválido");
  }
}

export function createAuthError(message: string, status: number = 401) {
  return {
    error: message,
    status
  };
}
