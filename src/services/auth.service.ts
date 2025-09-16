import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/database";
import { Categoria } from "@prisma/client";

export interface DadosCriarUsuario {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  categorias?: number[];
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface PayloadJWT {
  idUsuario: number;
  email: string;
  nome: string;
}

const CHAVE_JWT = process.env.JWT_SECRET || "chave-secreta-usada-apenas-em-dev";
const EXPIRACAO_JWT = "7d";

export class AuthService {
  static async criptografarSenha(senha: string): Promise<string> {
    return await bcrypt.hash(senha, 12);
  }

  static async verificarSenha(
    senha: string,
    senhaHasheada: string
  ): Promise<boolean> {
    return await bcrypt.compare(senha, senhaHasheada);
  }

  static gerarToken(payload: PayloadJWT): string {
    return jwt.sign(payload, CHAVE_JWT, { expiresIn: EXPIRACAO_JWT });
  }

  static verificarToken(token: string): PayloadJWT | null {
    try {
      return jwt.verify(token, CHAVE_JWT) as PayloadJWT;
    } catch {
      return null;
    }
  }

  static async registrar(dadosUsuario: DadosCriarUsuario) {
    const { nome, email, senha, telefone, categorias = [] } = dadosUsuario;

    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new Error("Email já está em uso");
    }

    const senhaHasheada = await this.criptografarSenha(senha);

    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHasheada,
        telefone,
        categoriasDeInteresse: {
          create: categorias.map((categoriaId) => ({
            id_categoria: categoriaId,
          })),
        },
      },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true,
          },
        },
      },
    });

    const token = this.gerarToken({
      idUsuario: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        categorias: usuario.categoriasDeInteresse.map(
          (ci: { categoria: Categoria }) => ci.categoria
        ),
      },
      token,
    };
  }

  static async fazerLogin(dadosLogin: DadosLogin) {
    const { email, senha } = dadosLogin;

    const usuario = await prisma.user.findUnique({
      where: { email },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new Error("Email ou senha incorretos");
    }

    const senhaValida = await this.verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error("Email ou senha incorretos");
    }

    const token = this.gerarToken({
      idUsuario: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        categorias: usuario.categoriasDeInteresse.map(
          (ci: { categoria: Categoria }) => ci.categoria
        ),
      },
      token,
    };
  }

  static async obterUsuarioDoToken(token: string) {
    const payload = this.verificarToken(token);
    if (!payload) {
      throw new Error("Token inválido");
    }

    const usuario = await prisma.user.findUnique({
      where: { id: payload.idUsuario },
      include: {
        categoriasDeInteresse: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      categorias: usuario.categoriasDeInteresse.map(
        (ci: { categoria: Categoria }) => ci.categoria
      ),
    };
  }

  static async exigirAuth(token: string) {
    if (!token) {
      throw new Error("Token não fornecido");
    }

    const usuario = await this.obterUsuarioDoToken(token);
    return usuario;
  }
}
