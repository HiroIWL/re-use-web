import { InteractionService } from "../../../../services/interaction.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../../lib/api";

const dislikeValidations: ValidationRule[] = [
  { field: 'idProduto', required: true, type: 'number', min: 1 }
];

export const POST = createApiHandler(
  async (request, { user, body }) => {
    const data = body as Record<string, unknown>;
    
    const dislike = await InteractionService.criarDislike({
      idUsuario: user!.id,
      idProduto: Number(data.idProduto)
    });

    return ApiResponseBuilder.success(
      {
        dislike: {
          id: dislike.id,
          produto: {
            id: dislike.produto.id,
            nome: dislike.produto.nome,
            categoria: dislike.produto.categoria.nome
          }
        }
      },
      "Dislike dado com sucesso!",
      201
    );
  },
  {
    requireAuth: true,
    validations: dislikeValidations,
    allowedMethods: ['POST']
  }
);
