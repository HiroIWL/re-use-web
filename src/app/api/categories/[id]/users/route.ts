import { CategoryService } from "../../../../../services/category.service";
import { createApiHandler, ApiResponseBuilder } from "../../../../../lib/api";

export const GET = createApiHandler(
  async (request, { params, query }) => {
    const id = Number(params!.id);
    
    if (isNaN(id)) {
      return ApiResponseBuilder.validationError('id', 'ID da categoria deve ser um número válido');
    }

    const pagina = Number(query?.pagina) || 1;
    const limite = Number(query?.limite) || 10;

    if (pagina < 1 || limite < 1 || limite > 100) {
      return ApiResponseBuilder.validationError('paginacao', 'Parâmetros de paginação inválidos');
    }

    const resultado = await CategoryService.obterUsuariosInteressados(id, pagina, limite);

    return ApiResponseBuilder.success(
      resultado,
      "Usuários interessados na categoria obtidos com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);
