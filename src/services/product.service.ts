import { Categoria } from "@prisma/client";
import { prisma } from "../db/database";

export interface DadosCriarProduto {
  nome: string;
  descricao: string;
  preco: number;
  idCategoria: number;
  idUsuario: number;
}

export interface DadosAtualizarProduto {
  nome?: string;
  descricao?: string;
  preco?: number;
  idCategoria?: number;
}

export interface FiltrosProduto {
  idCategoria?: number;
  idUsuario?: number;
  precoMinimo?: number;
  precoMaximo?: number;
  busca?: string;
  excluirIdUsuario?: number;
}

export class ProductService {
  static async criar(dadosProduto: DadosCriarProduto) {
    const { nome, descricao, preco, idCategoria, idUsuario } = dadosProduto;

    const categoria = await prisma.categoria.findUnique({
      where: { id: idCategoria },
    });

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco,
        idCategoria,
        idUsuario,
      },
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true,
          },
        },
      },
    });

    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria: (produto as unknown as { categoria: Categoria }).categoria,
      estatisticas: {
        likes: (produto as unknown as { _count: { likes: number } })._count
          .likes,
        dislikes: (produto as unknown as { _count: { dislikes: number } })
          ._count.dislikes,
        superLikes: (produto as unknown as { _count: { superLikes: number } })
          ._count.superLikes,
      },
    };
  }

  static async buscarPorId(id: number) {
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true,
          },
        },
      },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria: produto.categoria,
      estatisticas: {
        likes: produto._count.likes,
        dislikes: produto._count.dislikes,
        superLikes: produto._count.superLikes,
      },
    };
  }

  static async buscarVarios(
    filtros: FiltrosProduto = {},
    pagina = 1,
    limite = 10
  ) {
    const { idCategoria, idUsuario, precoMinimo, precoMaximo, busca } =
      filtros;
    const pular = (pagina - 1) * limite;

    const condicoes: Record<string, unknown> = {};

    if (idCategoria) {
      condicoes.idCategoria = idCategoria;
    }

    if (idUsuario) {
      condicoes.idUsuario = idUsuario;
    }

    if (precoMinimo !== undefined || precoMaximo !== undefined) {
      condicoes.preco = {} as Record<string, unknown>;
      if (precoMinimo !== undefined) (condicoes.preco as Record<string, unknown>).gte = precoMinimo;
      if (precoMaximo !== undefined) (condicoes.preco as Record<string, unknown>).lte = precoMaximo;
    }

    if (busca) {
      condicoes.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { descricao: { contains: busca, mode: "insensitive" } },
      ];
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where: condicoes,
        skip: pular,
        take: limite,
        include: {
          categoria: true,
          _count: {
            select: {
              likes: true,
              dislikes: true,
              superLikes: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
      prisma.produto.count({ where: condicoes }),
    ]);

    return {
      produtos: produtos.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        categoria: produto.categoria,
        estatisticas: {
          likes: produto._count.likes,
          dislikes: produto._count.dislikes,
          superLikes: produto._count.superLikes,
        },
      })),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  static async obterProdutosParaUsuario(
    idUsuario: number,
    pagina = 1,
    limite = 10
  ) {
    const pular = (pagina - 1) * limite;

    const interessesUsuario = await prisma.categoriasDeInteresse.findMany({
      where: { id_user: idUsuario },
      select: { id_categoria: true },
    });

    const idsCategoria = interessesUsuario.map(
      (interesse) => interesse.id_categoria
    );

    const produtos = await prisma.produto.findMany({
      where: {
        idCategoria: {
          in: idsCategoria.length > 0 ? idsCategoria : undefined,
        },
        NOT: {
          OR: [
            { likes: { some: { idUsuario } } },
            { dislikes: { some: { idUsuario } } },
            { superLikes: { some: { idUsuario } } },
          ],
        },
      },
      skip: pular,
      take: limite,
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria: produto.categoria,
      estatisticas: {
        likes: produto._count.likes,
        dislikes: produto._count.dislikes,
        superLikes: produto._count.superLikes,
      },
    }));
  }

  static async atualizar(id: number, dadosAtualizacao: DadosAtualizarProduto) {
    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      throw new Error("Produto não encontrado");
    }

    if (dadosAtualizacao.idCategoria) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: dadosAtualizacao.idCategoria },
      });

      if (!categoria) {
        throw new Error("Categoria não encontrada");
      }
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true,
          },
        },
      },
    });

    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria: produto.categoria,
      estatisticas: {
        likes: produto._count.likes,
        dislikes: produto._count.dislikes,
        superLikes: produto._count.superLikes,
      },
    };
  }

  static async deletar(id: number) {
    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    await prisma.produto.delete({
      where: { id },
    });

    return { mensagem: "Produto deletado com sucesso" };
  }

  static async buscarPorCategoria(
    idCategoria: number,
    pagina = 1,
    limite = 10
  ) {
    return this.buscarVarios({ idCategoria }, pagina, limite);
  }

  static async buscarSimilares(idProduto: number, limite = 5) {
    const produto = await prisma.produto.findUnique({
      where: { id: idProduto },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const faixaPreco = produto.preco * 0.3;
    const precoMinimo = produto.preco - faixaPreco;
    const precoMaximo = produto.preco + faixaPreco;

    const produtosSimilares = await prisma.produto.findMany({
      where: {
        AND: [
          { id: { not: idProduto } },
          { idCategoria: produto.idCategoria },
          {
            preco: {
              gte: precoMinimo,
              lte: precoMaximo,
            },
          },
        ],
      },
      take: limite,
      include: {
        categoria: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            superLikes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return produtosSimilares.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      categoria: p.categoria,
      estatisticas: {
        likes: p._count.likes,
        dislikes: p._count.dislikes,
        superLikes: p._count.superLikes,
      },
    }));
  }
}
