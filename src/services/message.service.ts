import { prisma } from "../db/database";

export interface DadosEnviarMensagem {
  idUsuario: number;
  idMatch: number;
  conteudo: string;
}

export class MessageService {
  static async verificarAcessoMatch(idUsuario: number, idMatch: number) {
    const match = await prisma.match.findFirst({
      where: {
        id: idMatch,
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
      },
    });

    if (!match) {
      throw new Error("Match não encontrado");
    }

    return match;
  }

  static async obterMensagensMatch(idUsuario: number, idMatch: number) {
    const match = await this.verificarAcessoMatch(idUsuario, idMatch);

    const mensagens = await prisma.mensagem.findMany({
      where: { idMatch },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        criadoEm: "asc",
      },
    });

    return {
      match: {
        id: match.id,
        outroUsuario:
          match.idUsuario1 === idUsuario ? match.usuario2 : match.usuario1,
        produto1: match.produto1,
        produto2: match.produto2,
        criadoEm: match.criadoEm,
      },
      mensagens: mensagens.map((msg) => ({
        id: msg.id,
        conteudo: msg.conteudo,
        criadoEm: msg.criadoEm,
        usuario: msg.usuario,
        deUsuario: msg.idUsuario === idUsuario,
      })),
    };
  }

  static async enviarMensagem(dados: DadosEnviarMensagem) {
    const { idUsuario, idMatch, conteudo } = dados;

    await this.verificarAcessoMatch(idUsuario, idMatch);

    const mensagem = await prisma.mensagem.create({
      data: {
        idUsuario,
        idMatch,
        conteudo,
      },
      include: {
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
      id: mensagem.id,
      conteudo: mensagem.conteudo,
      criadoEm: mensagem.criadoEm,
      usuario: mensagem.usuario,
      deUsuario: true,
    };
  }

  static async obterHistoricoMatches(idUsuario: number) {
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
              id: ultimaMensagem.id,
              conteudo: ultimaMensagem.conteudo,
              criadoEm: ultimaMensagem.criadoEm,
              deUsuario: ultimaMensagem.idUsuario === idUsuario,
            }
          : null,
      };
    });
  }
}
