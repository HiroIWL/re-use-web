'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Match } from '@/contexts';
import Modal from './Modal';
import Button from './Button';
import { useDateFormat } from '@/hooks/useDateFormat';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: Match;
}

export default function MatchModal({ isOpen, onClose, matchData }: MatchModalProps) {
  const router = useRouter();
  const { formatarPreco } = useDateFormat();

  const handleGoToChat = () => {
    onClose();
    router.push(`/chat/${matchData.id}`);
  };

  const handleContinueSwiping = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="É um MATCH!"
      size="lg"
      showCloseButton={false}
    >
      <div className="text-center space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">
            Vocês se interessaram pelos produtos um do outro!
          </h3>
          <p className="text-purple-100">
            Agora vocês podem conversar e combinar a troca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-600 font-medium">Seu produto</span>
              <span className="text-xs text-gray-500">{matchData.produto1.categoria.nome}</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{matchData.produto1.nome}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{matchData.produto1.descricao}</p>
            <p className="text-sm font-semibold text-green-600">{formatarPreco(matchData.produto1.preco)}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-600 font-medium">
                Produto de {matchData.outroUsuario.nome.split(' ')[0]}
              </span>
              <span className="text-xs text-gray-500">{matchData.produto2.categoria.nome}</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{matchData.produto2.nome}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{matchData.produto2.descricao}</p>
            <p className="text-sm font-semibold text-green-600">{formatarPreco(matchData.produto2.preco)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handleGoToChat}
            className="order-1 sm:order-2"
          >
            Ir para o Chat
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={handleContinueSwiping}
            className="order-2 sm:order-1"
          >
            Continuar navegando
          </Button>
        </div>
      </div>
    </Modal>
  );
}
