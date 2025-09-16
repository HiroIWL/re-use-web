import { UserService } from "../../../../services/user.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../../lib/api";

const updateInterestsValidations: ValidationRule[] = [
  { field: 'categorias', required: true, type: 'array', min: 2, max: 10 }
];

export const PUT = createApiHandler(
  async (request, { user, body }) => {
    const data = body as Record<string, unknown>;
    const { categorias } = data;


    const categoriasArray = Array.isArray(categorias) ? categorias : [];
    const categoriasNumeros = categoriasArray.map((cat: unknown) => {
      const numero = parseInt(String(cat));
      if (isNaN(numero)) {
        throw new Error(`Categoria inválida: ${cat}`);
      }
      return numero;
    });

    const usuarioAtualizado = await UserService.atualizar(user!.id, {
      categorias: categoriasNumeros
    });

    return ApiResponseBuilder.success(
      {
        usuario: {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email,
          categorias: usuarioAtualizado.categorias
        }
      },
      "Categorias de interesse atualizadas com sucesso"
    );
  },
  {
    requireAuth: true,
    validations: updateInterestsValidations,
    allowedMethods: ['PUT']
  }
);

export const GET = createApiHandler(
  async (request, { user }) => {
    const usuarioCompleto = await UserService.buscarPorId(user!.id);

    return ApiResponseBuilder.success(
      { categorias: usuarioCompleto.categorias },
      "Categorias de interesse obtidas com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);
