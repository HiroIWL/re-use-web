'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageLayout from '../../../components/layout/PageLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/forms/Input';
import Loading from '../../../components/common/Loading';
import { useAuthContext, useMatchContext } from '@/contexts';
import { useDateFormat } from '../../../hooks/useDateFormat';

export default function ChatPage() {
  const { } = useAuthContext();
  const { 
    activeChat, 
    isLoadingChat, 
    loadChat, 
    sendMessage, 
    isSendingMessage,
    clearActiveChat 
  } = useMatchContext();
  const { formatarData, formatarDataSimples } = useDateFormat();
  
  const [novaMensagem, setNovaMensagem] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const matchId = parseInt(params.matchId as string);

  useEffect(() => {
    if (matchId) {
      loadChat(matchId).catch((err) => {
        setError(err.message || 'Erro ao carregar chat');
      });
    }
    
    return () => {
      clearActiveChat();
    };
  }, [matchId, loadChat, clearActiveChat]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || !activeChat?.match) return;

    try {
      await sendMessage(activeChat.match.id, {
        conteudo: novaMensagem.trim()
      });
      
      setNovaMensagem('');
    } catch {
      setError('Erro ao enviar mensagem');
    }
  };

  const navigation = [
    { label: 'Início', href: '/swipe' },
    { label: 'Matches', href: '/matches' },
    { label: 'Meus Produtos', href: '/my-products' }
  ];

  if (isLoadingChat) {
    return (
      <PageLayout navigation={navigation}>
        <div className="flex justify-center items-center min-h-screen">
          <Loading />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout navigation={navigation}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/matches')}>
            Voltar aos Matches
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (!activeChat?.match) {
    return (
      <PageLayout navigation={navigation}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat não encontrado</h2>
          <p className="text-gray-600 mb-4">Este chat não existe ou você não tem acesso a ele.</p>
          <Button onClick={() => router.push('/matches')}>
            Voltar aos Matches
          </Button>
        </div>
      </PageLayout>
    );
  }

  const { match } = activeChat;

  return (
    <PageLayout navigation={navigation}>
      <div className="flex flex-col h-screen max-h-screen">
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">
                {match.outroUsuario.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{match.outroUsuario.nome}</h2>
              <p className="text-sm text-gray-500">Match desde {formatarData(match.criadoEm)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeChat.mensagens.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            activeChat.mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex ${!mensagem.deUsuario ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    !mensagem.deUsuario
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <p className="text-sm">{mensagem.conteudo}</p>
                  <p className={`text-xs mt-1 ${
                    !mensagem.deUsuario
                      ? 'text-gray-500'
                      : 'text-purple-100'
                  }`}>
                    {formatarDataSimples(mensagem.criadoEm)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t p-4">
          <form onSubmit={handleEnviarMensagem} className="flex gap-2">
            <Input
              type="text"
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder={`Enviar mensagem para ${match.outroUsuario.nome.split(' ')[0]}...`}
              disabled={isSendingMessage}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!novaMensagem.trim() || isSendingMessage}
              loading={isSendingMessage}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isSendingMessage ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}