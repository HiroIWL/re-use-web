import { NextResponse } from "next/server";
import { AuthService } from "../../../../services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, telefone, categorias } = body;

    if (!nome || !email || !senha || !telefone) {
      return NextResponse.json(
        { error: "Nome, email, senha e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const resultado = await AuthService.registrar({
      nome,
      email,
      senha,
      telefone,
      categorias: categorias || [],
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        usuario: resultado.usuario,
        token: resultado.token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erro no registro:", error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    if (errorMessage === "Email já está em uso") {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


export async function GET() {
    return NextResponse.json({ message: "Hello, world!" }, { status: 200 });
}