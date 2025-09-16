import { prisma } from "../db/database";

export interface DadosCriarLike {
  idUsuario: number;
  idProduto: number;
}

export interface DadosCriarDislike {
  idUsuario: number;
  idProduto: number;
}

export interface DadosCriarSuperLike {
  idUsuario: number;
  idProduto: number;
  mensagem: string;
  idProdutoOfertado?: number;
}

export class InteractionService {
  static async criarLike(dadosLike: DadosCriarLike) {
    const { idUsuario, idProduto } = dadosLike;

    const produto = await prisma.produto.findUnique({
      where: { id: idProduto },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const interacaoExistente = await this.obterInteracaoUsuarioProduto(
      idUsuario,
      idProduto
    );
    if (interacaoExistente) {
      throw new Error(`Você já ${interacaoExistente} este produto`);
    }

    const like = await prisma.like.create({
      data: {
        idUsuario,
        idProduto,
      },
      include: {
        produto: {
          include: {
            categoria: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    const match = await this.verificarECriarMatch(idUsuario, idProduto);

    return {
      id: like.id,
      usuario: like.usuario,
      produto: {
        id: like.produto.id,
        nome: like.produto.nome,
        descricao: like.produto.descricao,
        preco: like.produto.preco,
        categoria: like.produto.categoria,
      },
      match: match
        ? {
            id: match.id,
            outroUsuario:
              match.idUsuario1 === idUsuario ? match.usuario2 : match.usuario1,
            produto1: match.produto1,
            produto2: match.produto2,
          }
        : null,
    };
  }

  static async criarDislike(dadosDislike: DadosCriarDislike) {
    const { idUsuario, idProduto } = dadosDislike;

    const produto = await prisma.produto.findUnique({
      where: { id: idProduto },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const interacaoExistente = await this.obterInteracaoUsuarioProduto(
      idUsuario,
      idProduto
    );
    if (interacaoExistente) {
      throw new Error(`Você já ${interacaoExistente} este produto`);
    }

    const dislike = await prisma.dislike.create({
      data: {
        idUsuario,
        idProduto,
      },
      include: {
        produto: {
          include: {
            categoria: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return {
      id: dislike.id,
      usuario: dislike.usuario,
      produto: {
        id: dislike.produto.id,
        nome: dislike.produto.nome,
        descricao: dislike.produto.descricao,
        preco: dislike.produto.preco,
        categoria: dislike.produto.categoria,
      },
    };
  }

  static async criarSuperLike(dadosSuperLike: DadosCriarSuperLike) {
    const { idUsuario, idProduto, mensagem, idProdutoOfertado } =
      dadosSuperLike;

    const produto = await prisma.produto.findUnique({
      where: { id: idProduto },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    if (idProdutoOfertado) {
      const produtoOfertado = await prisma.produto.findUnique({
        where: { id: idProdutoOfertado },
      });

      if (!produtoOfertado) {
        throw new Error("Produto ofertado não encontrado");
      }

      if (idProdutoOfertado === idProduto) {
        throw new Error("Não é possível ofertar um produto por ele mesmo");
      }
    }

    const interacaoExistente = await this.obterInteracaoUsuarioProduto(
      idUsuario,
      idProduto
    );
    if (interacaoExistente) {
      throw new Error(`Você já ${interacaoExistente} este produto`);
    }

    const resultado = await prisma.$transaction(async (transacao) => {
      const superLike = await transacao.superLike.create({
        data: {
          idUsuario,
          idProduto,
          mensagem,
        },
        include: {
          produto: {
            include: {
              categoria: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      });

      let proposta = null;

      if (idProdutoOfertado) {
        proposta = await transacao.proposta.create({
          data: {
            idUsuario,
            idProdutoOfertado,
            idProdutoSolicitado: idProduto,
          },
          include: {
            produtoOfertado: {
              include: {
                categoria: true,
              },
            },
          },
        });
      }

      return { superLike, proposta };
    });

    const resposta: Record<string, unknown> = {
      id: resultado.superLike.id,
      mensagem: resultado.superLike.mensagem,
      usuario: resultado.superLike.usuario,
      produto: {
        id: resultado.superLike.produto.id,
        nome: resultado.superLike.produto.nome,
        descricao: resultado.superLike.produto.descricao,
        preco: resultado.superLike.produto.preco,
        categoria: resultado.superLike.produto.categoria,
      },
    };

    if (resultado.proposta) {
      resposta.propostaAutomatica = {
        id: resultado.proposta.id,
        produtoOfertado: {
          id: resultado.proposta.produtoOfertado.id,
          nome: resultado.proposta.produtoOfertado.nome,
          descricao: resultado.proposta.produtoOfertado.descricao,
          preco: resultado.proposta.produtoOfertado.preco,
          categoria: resultado.proposta.produtoOfertado.categoria,
        },
      };
    }

    return resposta;
  }

  static async obterInteracaoUsuarioProduto(
    idUsuario: number,
    idProduto: number
  ): Promise<string | null> {
    const [like, dislike, superLike] = await Promise.all([
      prisma.like.findFirst({
        where: { idUsuario, idProduto },
      }),
      prisma.dislike.findFirst({
        where: { idUsuario, idProduto },
      }),
      prisma.superLike.findFirst({
        where: { idUsuario, idProduto },
      }),
    ]);

    if (like) return "curtiu";
    if (dislike) return "rejeitou";
    if (superLike) return "super curtiu";
    return null;
  }

  static async obterLikesUsuario(idUsuario: number, pagina = 1, limite = 10) {
    const pular = (pagina - 1) * limite;

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { idUsuario },
        skip: pular,
        take: limite,
        include: {
          produto: {
            include: {
              categoria: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
      prisma.like.count({
        where: { idUsuario },
      }),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        produto: {
          id: like.produto.id,
          nome: like.produto.nome,
          descricao: like.produto.descricao,
          preco: like.produto.preco,
          categoria: like.produto.categoria,
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

  static async obterSuperLikesRecebidos(
    idUsuario: number,
    pagina = 1,
    limite = 10
  ) {
    const pular = (pagina - 1) * limite;

    const [superLikes, total] = await Promise.all([
      prisma.superLike.findMany({
        where: {},
        skip: pular,
        take: limite,
        include: {
          produto: {
            include: {
              categoria: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      }),
      prisma.superLike.count({
        where: {},
      }),
    ]);

    return {
      superLikes: superLikes.map((superLike) => ({
        id: superLike.id,
        mensagem: superLike.mensagem,
        usuario: superLike.usuario,
        produto: {
          id: superLike.produto.id,
          nome: superLike.produto.nome,
          descricao: superLike.produto.descricao,
          preco: superLike.produto.preco,
          categoria: superLike.produto.categoria,
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

  static async obterEstatisticasProduto(idProduto: number) {
    const [likes, dislikes, superLikes] = await Promise.all([
      prisma.like.count({
        where: { idProduto },
      }),
      prisma.dislike.count({
        where: { idProduto },
      }),
      prisma.superLike.count({
        where: { idProduto },
      }),
    ]);

    return {
      likes,
      dislikes,
      superLikes,
      total: likes + dislikes + superLikes,
    };
  }

  static async removerInteracao(idUsuario: number, idProduto: number) {
    const [likesRemovidos, dislikesRemovidos, superLikesRemovidos] =
      await Promise.all([
        prisma.like.deleteMany({
          where: { idUsuario, idProduto },
        }),
        prisma.dislike.deleteMany({
          where: { idUsuario, idProduto },
        }),
        prisma.superLike.deleteMany({
          where: { idUsuario, idProduto },
        }),
      ]);

    const totalRemovidos =
      likesRemovidos.count +
      dislikesRemovidos.count +
      superLikesRemovidos.count;

    if (totalRemovidos === 0) {
      throw new Error("Nenhuma interação encontrada para remover");
    }

    return { mensagem: "Interação removida com sucesso" };
  }

  static async obterMatchesPotenciais(idUsuario: number) {
    const likesUsuario = await prisma.like.findMany({
      where: { idUsuario },
      include: {
        produto: {
          include: {
            categoria: true,
            likes: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return likesUsuario.map((like) => ({
      produto: {
        id: like.produto.id,
        nome: like.produto.nome,
        descricao: like.produto.descricao,
        preco: like.produto.preco,
        categoria: like.produto.categoria,
      },
      interessados: like.produto.likes.map((l) => l.usuario),
    }));
  }

  static async verificarECriarMatch(idUsuario: number, idProduto: number) {
    const produto = await prisma.produto.findUnique({
      where: { id: idProduto },
      include: {
        usuario: true,
        categoria: true,
      },
    });

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const donoId = produto.idUsuario;

    const likeReciprico = await prisma.like.findFirst({
      where: {
        idUsuario: donoId,
        produto: {
          idUsuario: idUsuario,
        },
      },
      include: {
        produto: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (likeReciprico) {
      const matchExistente = await prisma.match.findFirst({
        where: {
          OR: [
            { idUsuario1: idUsuario, idUsuario2: donoId },
            { idUsuario1: donoId, idUsuario2: idUsuario },
          ],
        },
      });

      if (!matchExistente) {
        const match = await prisma.match.create({
          data: {
            idUsuario1: Math.min(idUsuario, donoId),
            idUsuario2: Math.max(idUsuario, donoId),
            idProduto1: likeReciprico.idProduto,
            idProduto2: idProduto,
          },
          include: {
            usuario1: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            usuario2: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            produto1: {
              include: {
                categoria: true,
              },
            },
            produto2: {
              include: {
                categoria: true,
              },
            },
          },
        });

        return match;
      }
    }

    return null;
  }

  static async obterMatches(idUsuario: number) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ idUsuario1: idUsuario }, { idUsuario2: idUsuario }],
      },
      include: {
        usuario1: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        usuario2: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        produto1: {
          include: {
            categoria: true,
          },
        },
        produto2: {
          include: {
            categoria: true,
          },
        },
        mensagens: {
          orderBy: {
            criadoEm: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return matches.map((match) => {
      const outroUsuario =
        match.idUsuario1 === idUsuario ? match.usuario2 : match.usuario1;
      const ultimaMensagem = match.mensagens[0] || null;

      return {
        id: match.id,
        outroUsuario,
        produto1: match.produto1,
        produto2: match.produto2,
        criadoEm: match.criadoEm,
        ultimaMensagem: ultimaMensagem
          ? {
              conteudo: ultimaMensagem.conteudo,
              criadoEm: ultimaMensagem.criadoEm,
              deUsuario: ultimaMensagem.idUsuario === idUsuario,
            }
          : null,
      };
    });
  }

  static async obterSuperLikesComPropostas(
    idUsuario: number,
    pagina = 1,
    limite = 10
  ) {
    const pular = (pagina - 1) * limite;

    const superLikes = await prisma.superLike.findMany({
      where: { idUsuario },
      skip: pular,
      take: limite,
      include: {
        produto: {
          include: {
            categoria: true,
            propostasSolicitadas: {
              where: { idUsuario },
              include: {
                produtoOfertado: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return superLikes.map((superLike) => ({
      id: superLike.id,
      mensagem: superLike.mensagem,
      produto: {
        id: superLike.produto.id,
        nome: superLike.produto.nome,
        descricao: superLike.produto.descricao,
        preco: superLike.produto.preco,
        categoria: superLike.produto.categoria,
      },
      propostas: superLike.produto.propostasSolicitadas.map((proposta) => ({
        id: proposta.id,
        produtoOfertado: {
          id: proposta.produtoOfertado.id,
          nome: proposta.produtoOfertado.nome,
          descricao: proposta.produtoOfertado.descricao,
          preco: proposta.produtoOfertado.preco,
          categoria: proposta.produtoOfertado.categoria,
        },
      })),
    }));
  }
}
