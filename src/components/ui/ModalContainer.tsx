'use client';

import React from 'react';
import { useAppState } from '@/contexts';
import { Match, Product } from '@/contexts/types';
import Modal from './Modal';
import Button from './Button';
import MatchModal from './MatchModal';
import SuperLikeModal from './SuperLikeModal';

export default function ModalContainer() {
  const { activeModals, closeModal } = useAppState();

  if (activeModals.length === 0) return null;

  return (
    <>
      {activeModals.map((modalConfig) => {
        const { id, type, title, content, data, size, showCloseButton, onClose, actions } = modalConfig;

        const handleClose = () => {
          if (onClose) onClose();
          closeModal(id);
        };

        if (type === 'match' && data) {
          return (
            <MatchModal
              key={id}
              isOpen={true}
              onClose={handleClose}
              matchData={data as unknown as Match}
            />
          );
        }

        if (type === 'superlike' && data) {
          return (
            <SuperLikeModal
              key={id}
              isOpen={true}
              onClose={handleClose}
              productId={Number((data as Record<string, unknown>).productId)}
              myProducts={(data as Record<string, unknown>).myProducts as Product[]}
            />
          );
        }

        return (
          <Modal
            key={id}
            isOpen={true}
            onClose={handleClose}
            title={title}
            size={size}
            showCloseButton={showCloseButton}
          >
            {content}
            
            {actions && actions.length > 0 && (
              <div className="flex gap-2 mt-4 justify-end">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'primary'}
                    onClick={action.onClick}
                    loading={action.loading}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </Modal>
        );
      })}
    </>
  );
}
