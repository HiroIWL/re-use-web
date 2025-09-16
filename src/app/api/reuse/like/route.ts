import { InteractionService } from "../../../../services/interaction.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../../lib/api";

const likeValidations: ValidationRule[] = [
  { field: 'idProduto', required: true, type: 'number', min: 1 }
];

export const POST = createApiHandler(
  async (request, { user, body }) => {
    const data = body as Record<string, unknown>;
    const idProduto = Number(data.idProduto);
    
    const like = await InteractionService.criarLike({
      idUsuario: user!.id,
      idProduto
    });

    const match = await InteractionService.verificarECriarMatch(user!.id, idProduto);

    return ApiResponseBuilder.success(
      {
        like: {
          id: like.id,
          produto: {
            id: like.produto.id,
            nome: like.produto.nome,
            categoria: like.produto.categoria.nome
          }
        },
        match: match || undefined
      },
      "Like dado com sucesso!",
      201
    );
  },
  {
    requireAuth: true,
    validations: likeValidations,
    allowedMethods: ['POST']
  }
);
