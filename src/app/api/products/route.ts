import { ProductService } from "../../../services/product.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../lib/api";

const createProductValidations: ValidationRule[] = [
  { field: 'nome', required: true, type: 'string', min: 1, max: 100 },
  { field: 'descricao', required: true, type: 'string', min: 1, max: 500 },
  { field: 'preco', required: true, type: 'number', min: 0.01 },
  { field: 'idCategoria', required: true, type: 'number', min: 1 }
];

export const POST = createApiHandler(
  async (request, { user, body }) => {
    const data = body as Record<string, unknown>;
    
    const produto = await ProductService.criar({
      nome: String(data.nome).trim(),
      descricao: String(data.descricao).trim(),
      preco: Number(data.preco),
      idCategoria: Number(data.idCategoria),
      idUsuario: user!.id
    });

    return ApiResponseBuilder.success(
      { produto },
      "Produto criado com sucesso!",
      201
    );
  },
  {
    requireAuth: true,
    validations: createProductValidations,
    allowedMethods: ['POST']
  }
);

export const GET = createApiHandler(
  async (request, { user, query }) => {
    const categoria = query?.categoria ? Number(query.categoria) : undefined;
    const limite = Number(query?.limite) || 20;

    const filtros: Record<string, unknown> = { idUsuario: user!.id };
    if (categoria) {
      filtros.idCategoria = categoria;
    }
    
    const produtos = await ProductService.buscarVarios(filtros, 1, limite);

    return ApiResponseBuilder.success(produtos, "Produtos obtidos com sucesso");
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);