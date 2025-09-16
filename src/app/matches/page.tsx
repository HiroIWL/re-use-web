'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Loading from '../../components/common/Loading';
import { useAuthContext, useMatchContext } from '@/contexts';
import { useDateFormat } from '../../hooks/useDateFormat';


export default function MatchesPage() {
  const { } = useAuthContext();
  const { matches, isLoadingMatches, loadMatches } = useMatchContext();
  const { formatarData, formatarDataCompleta } = useDateFormat();
  const router = useRouter();

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const iniciarChat = (matchId: number) => {
    router.push(`/chat/${matchId}`);
  };



    const navigation = [
        { label: 'Início', href: '/swipe' },
        { label: 'Matches', href: '/matches', isActive: true },
        { label: 'Meus Produtos', href: '/my-products' }
    ];

  if (isLoadingMatches) {
    return (
      <PageLayout navigation={navigation}>
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout navigation={navigation}>
      <div className="space-y-6">
        {matches.length === 0 ? (
          <EmptyState
            title="Nenhum match ainda"
            description="Continue curtindo produtos para encontrar pessoas com interesses similares!"
            actionLabel="Descobrir produtos"
            onAction={() => router.push('/swipe')}
          />
        ) : (
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-6">
              <p className="mt-6">Você tem {matches.length} match{matches.length !== 1 ? 'es' : ''}!</p>
            </div>
            
            {matches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {match.outroUsuario.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Match em {formatarDataCompleta(match.criadoEm)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => iniciarChat(match.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {match.ultimaMensagem ? 'Continuar conversa' : 'Iniciar conversa'}
                  </Button>
                </div>

                {match.ultimaMensagem && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">
                        {match.ultimaMensagem.deUsuario ? 'Você' : match.outroUsuario.nome.split(' ')[0]}:
                      </span>
                      <span className="flex-1 truncate">{match.ultimaMensagem.conteudo}</span>
                      <span className="text-xs text-gray-400">
                        {formatarData(match.ultimaMensagem.criadoEm)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
