import { prisma } from '../db/database';

export interface DadosAtualizarUsuario {
  nome?: string;
  telefone?: string;
  categorias?: number[];
}

export class UserService {
  static async buscarPorId(id: number) {
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true
          }
        }
      }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      categorias: usuario.categoriasDeInteresse.map(ci => ci.categoria)
    };
  }

  static async buscarPorEmail(email: string) {
    const usuario = await prisma.user.findUnique({
      where: { email },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true
          }
        }
      }
    });

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      categorias: usuario.categoriasDeInteresse.map(ci => ci.categoria)
    };
  }

  static async atualizar(id: number, dadosAtualizacao: DadosAtualizarUsuario) {
    const { nome, telefone, categorias } = dadosAtualizacao;

    
    const dadosParaAtualizar: Record<string, unknown> = {};
    if (nome) dadosParaAtualizar.nome = nome;
    if (telefone) dadosParaAtualizar.telefone = telefone;

    
    if (categorias !== undefined) {
      
      await prisma.categoriasDeInteresse.deleteMany({
        where: { id_user: id }
      });

      dadosParaAtualizar.categoriasDeInteresse = {
        create: categorias.map(categoriaId => ({
          id_categoria: categoriaId
        }))
      };
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: dadosParaAtualizar,
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true
          }
        }
      }
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      categorias: usuario.categoriasDeInteresse.map(ci => ci.categoria)
    };
  }

  static async deletar(id: number) {
    
    const usuario = await prisma.user.findUnique({
      where: { id }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    
    await prisma.user.delete({
      where: { id }
    });

    return { mensagem: 'Usuário deletado com sucesso' };
  }

  static async listarTodos(pagina = 1, limite = 10) {
    const pular = (pagina - 1) * limite;

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        skip: pular,
        take: limite,
        include: {
          categoriasDeInteresse: {
            include: {
              categoria: true
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    return {
      usuarios: usuarios.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        categorias: usuario.categoriasDeInteresse.map(ci => ci.categoria)
      })),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    };
  }

  static async buscarPorCategoria(idCategoria: number) {
    const usuarios = await prisma.user.findMany({
      where: {
        categoriasDeInteresse: {
          some: {
            id_categoria: idCategoria
          }
        }
      },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true
          }
        }
      }
    });

    return usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      categorias: usuario.categoriasDeInteresse.map(ci => ci.categoria)
    }));
  }

  static async adicionarInteresseCategoria(idUsuario: number, idCategoria: number) {
    
    const jaExiste = await prisma.categoriasDeInteresse.findFirst({
      where: {
        id_user: idUsuario,
        id_categoria: idCategoria
      }
    });

    if (jaExiste) {
      throw new Error('Categoria já está nas suas preferências');
    }

    await prisma.categoriasDeInteresse.create({
      data: {
        id_user: idUsuario,
        id_categoria: idCategoria
      }
    });

    return { mensagem: 'Categoria adicionada às suas preferências' };
  }

  static async removerInteresseCategoria(idUsuario: number, idCategoria: number) {
    const removidos = await prisma.categoriasDeInteresse.deleteMany({
      where: {
        id_user: idUsuario,
        id_categoria: idCategoria
      }
    });

    if (removidos.count === 0) {
      throw new Error('Categoria não encontrada nas suas preferências');
    }

    return { mensagem: 'Categoria removida das suas preferências' };
  }
}
