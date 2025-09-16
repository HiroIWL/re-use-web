import { NextResponse } from "next/server";
import { AuthService } from "../../../../services/auth.service";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, senha } = body;

        if (!email || !senha) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios" }, 
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Email inválido" }, 
                { status: 400 }
            );
        }

        const resultado = await AuthService.fazerLogin({
            email,
            senha
        }); 

        return NextResponse.json({
            message: "Login realizado com sucesso",
            usuario: resultado.usuario,
            token: resultado.token
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("Erro no login:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        if (errorMessage === "Email ou senha incorretos") {
            return NextResponse.json(
                { error: "Email ou senha incorretos" }, 
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Erro interno do servidor" }, 
            { status: 500 }
        );
    }
}

