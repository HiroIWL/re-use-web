import { InteractionService } from "../../../../services/interaction.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../../lib/api";

const superLikeValidations: ValidationRule[] = [
  { field: 'idProduto', required: true, type: 'number', min: 1 },
  { field: 'mensagem', required: true, type: 'string', min: 1, max: 500 },
  { field: 'idProdutoOfertado', required: false, type: 'number', min: 1 }
];

export const POST = createApiHandler(
  async (request, { user, body }) => {
    const data = body as Record<string, unknown>;
    const { idProduto, mensagem, idProdutoOfertado } = data;

    const superLike = await InteractionService.criarSuperLike({
      idUsuario: user!.id,
      idProduto: Number(idProduto),
      mensagem: String(mensagem),
      idProdutoOfertado: idProdutoOfertado ? Number(idProdutoOfertado) : undefined
    });

    const match = await InteractionService.verificarECriarMatch(user!.id, Number(idProduto));

    return ApiResponseBuilder.success(
      {
        superLike: {
          id: (superLike as Record<string, unknown>).id,
          mensagem: (superLike as Record<string, unknown>).mensagem,
          produto: {
            id: ((superLike as Record<string, unknown>).produto as Record<string, unknown>).id,
            nome: ((superLike as Record<string, unknown>).produto as Record<string, unknown>).nome,
            categoria: (((superLike as Record<string, unknown>).produto as Record<string, unknown>).categoria as Record<string, unknown>).nome
          }
        },
        match: match || undefined
      },
      "Super like dado com sucesso!",
      201
    );
  },
  {
    requireAuth: true,
    validations: superLikeValidations,
    allowedMethods: ['POST']
  }
);
