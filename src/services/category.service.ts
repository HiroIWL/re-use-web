import { prisma } from "../db/database";

export class CategoryService {
  static async listarTodas() {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            produtos: true,
            categoriasDeInteresse: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      estatisticas: {
        produtos: categoria._count.produtos,
        interessados: categoria._count.categoriasDeInteresse,
      },
    }));
  }

  static async buscarPorId(id: number) {
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produtos: true,
            categoriasDeInteresse: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    return {
      id: categoria.id,
      nome: categoria.nome,
      estatisticas: {
        produtos: categoria._count.produtos,
        interessados: categoria._count.categoriasDeInteresse,
      },
    };
  }

  static async buscar(termoBusca: string) {
    const categorias = await prisma.categoria.findMany({
      where: {
        nome: {
          contains: termoBusca,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: {
            produtos: true,
            categoriasDeInteresse: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      estatisticas: {
        produtos: categoria._count.produtos,
        interessados: categoria._count.categoriasDeInteresse,
      },
    }));
  }

  static async obterMaisPopulares(limite = 10) {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            produtos: true,
            categoriasDeInteresse: true,
          },
        },
      },
      orderBy: {
        produtos: {
          _count: "desc",
        },
      },
      take: limite,
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      estatisticas: {
        produtos: categoria._count.produtos,
        interessados: categoria._count.categoriasDeInteresse,
      },
    }));
  }

  static async obterMaisInteressantes(limite = 10) {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            produtos: true,
            categoriasDeInteresse: true,
          },
        },
      },
      orderBy: {
        categoriasDeInteresse: {
          _count: "desc",
        },
      },
      take: limite,
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      estatisticas: {
        produtos: categoria._count.produtos,
        interessados: categoria._count.categoriasDeInteresse,
      },
    }));
  }

  static async obterProdutosCategoria(
    idCategoria: number,
    pagina = 1,
    limite = 10
  ) {
    const pular = (pagina - 1) * limite;

    const categoria = await prisma.categoria.findUnique({
      where: { id: idCategoria },
    });

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where: { idCategoria },
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
      prisma.produto.count({
        where: { idCategoria },
      }),
    ]);

    return {
      categoria: {
        id: categoria.id,
        nome: categoria.nome,
      },
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

  static async obterUsuariosInteressados(
    idCategoria: number,
    pagina = 1,
    limite = 10
  ) {
    const pular = (pagina - 1) * limite;

    const categoria = await prisma.categoria.findUnique({
      where: { id: idCategoria },
    });

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    const [interesses, total] = await Promise.all([
      prisma.categoriasDeInteresse.findMany({
        where: { id_categoria: idCategoria },
        skip: pular,
        take: limite,
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      }),
      prisma.categoriasDeInteresse.count({
        where: { id_categoria: idCategoria },
      }),
    ]);

    return {
      categoria: {
        id: categoria.id,
        nome: categoria.nome,
      },
      usuarios: interesses.map((interesse) => interesse.user),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  static async obterCategoriasRelacionadas(idCategoria: number, limite = 5) {
    const usuariosInteressados = await prisma.categoriasDeInteresse.findMany({
      where: { id_categoria: idCategoria },
      select: { id_user: true },
    });

    if (usuariosInteressados.length === 0) {
      return [];
    }

    const idsUsuarios = usuariosInteressados.map((u) => u.id_user);

    const categoriasRelacionadas = await prisma.categoriasDeInteresse.findMany({
      where: {
        AND: [
          { id_user: { in: idsUsuarios } },
          { id_categoria: { not: idCategoria } },
        ],
      },
      include: {
        categoria: {
          include: {
            _count: {
              select: {
                produtos: true,
                categoriasDeInteresse: true,
              },
            },
          },
        },
      },
    });

    const contagemCategorias = new Map();
    categoriasRelacionadas.forEach((relacao) => {
      const categoria = relacao.categoria;
      if (contagemCategorias.has(categoria.id)) {
        contagemCategorias.get(categoria.id).count++;
      } else {
        contagemCategorias.set(categoria.id, {
          categoria,
          count: 1,
        });
      }
    });

    const categoriasOrdenadas = Array.from(contagemCategorias.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limite);

    return categoriasOrdenadas.map((item) => ({
      id: item.categoria.id,
      nome: item.categoria.nome,
      estatisticas: {
        produtos: item.categoria._count.produtos,
        interessados: item.categoria._count.categoriasDeInteresse,
      },
      usuariosEmComum: item.count,
    }));
  }
}
