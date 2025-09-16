'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo, Input, Button } from '@/components';
import { useAuthContext } from '@/contexts';

export default function Home() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/swipe');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ email, senha });
      router.push('/swipe');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      
      <div className="mb-8">
        <Logo size="xl" className="text-center" />
      </div>

      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-gray-700">
            Faça seu login ou{' '}
            <Link href="/register" className="text-purple-600 hover:text-purple-700 underline">
              crie sua conta
            </Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o e-mail cadastrado aqui"
            label="E-mail"
            required
          />

          
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite a sua melhor senha"
            label="Senha"
            required
            showPasswordToggle={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            Entrar na conta
          </Button>

          
          <div className="text-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Esqueceu a sua senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
