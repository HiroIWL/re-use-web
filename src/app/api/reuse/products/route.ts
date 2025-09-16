import { prisma } from "../../../../db/database";
import { createApiHandler, ApiResponseBuilder } from "../../../../lib/api";

export const GET = createApiHandler(
  async (request, { user, query }) => {
    const limite = Number(query?.limite) || 10;
    const idCategoria = query?.categoria ? Number(query.categoria) : undefined;

    const [produtosInteragidos, produtosDisliked, produtosSuperLiked] = await Promise.all([
      prisma.like.findMany({
        where: { idUsuario: user!.id },
        select: { idProduto: true }
      }),
      prisma.dislike.findMany({
        where: { idUsuario: user!.id },
        select: { idProduto: true }
      }),
      prisma.superLike.findMany({
        where: { idUsuario: user!.id },
        select: { idProduto: true }
      })
    ]);

    const idsExcluir = [
      ...produtosInteragidos.map(p => p.idProduto),
      ...produtosDisliked.map(p => p.idProduto),
      ...produtosSuperLiked.map(p => p.idProduto)
    ];

    const produtos = await prisma.produto.findMany({
      where: {
        id: { notIn: idsExcluir },
        idUsuario: { not: user!.id },
        ...(idCategoria && { idCategoria })
      },
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true
          }
        }
      },
      take: limite,
      orderBy: { id: "desc" }
    });

    const produtosFormatados = produtos.map(produto => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria: produto.categoria,
      estatisticas: {
        likes: produto._count.likes,
        dislikes: produto._count.dislikes,
        superLikes: produto._count.superLikes
      }
    }));

    return ApiResponseBuilder.success(
      { produtos: produtosFormatados },
      "Produtos para swipe obtidos com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);
