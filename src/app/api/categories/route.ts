import { CategoryService } from "../../../services/category.service";
import { createApiHandler, ApiResponseBuilder } from "../../../lib/api";

export const GET = createApiHandler(
  async (request, { query }) => {
    const busca = query?.busca;
    const tipo = query?.tipo as 'populares' | 'interessantes' | undefined;
    const limite = Number(query?.limite) || 10;

    let categorias;

    if (busca) {
      categorias = await CategoryService.buscar(busca);
    } else if (tipo === "populares") {
      categorias = await CategoryService.obterMaisPopulares(limite);
    } else if (tipo === "interessantes") {
      categorias = await CategoryService.obterMaisInteressantes(limite);
    } else {
      categorias = await CategoryService.listarTodas();
    }

    return ApiResponseBuilder.success(
      { categorias },
      "Categorias obtidas com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);
