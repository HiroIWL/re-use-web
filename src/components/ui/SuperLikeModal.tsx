"use client";

import React, { useState } from "react";
import { Product, useProductContext, useAppState } from "@/contexts";
import Modal from "./Modal";
import Button from "./Button";
import Textarea from "../forms/Textarea";
import Select from "../forms/Select";

interface SuperLikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  myProducts: Product[];
}

export default function SuperLikeModal({
  isOpen,
  onClose,
  productId,
  myProducts,
}: SuperLikeModalProps) {
  const { superLikeProduct, isInteracting } = useProductContext();
  const { showSuccess, showError } = useAppState();

  const [selectedProductOffer, setSelectedProductOffer] = useState<
    number | null
  >(null);
  const [superLikeMessage, setSuperLikeMessage] = useState("");

  const handleSuperLike = async () => {
    if (!selectedProductOffer || !superLikeMessage.trim()) {
      showError(
        "Campos obrigatórios",
        "Selecione um produto e escreva uma mensagem."
      );
      return;
    }

    await superLikeProduct(productId, superLikeMessage, selectedProductOffer);

    showSuccess("Super Like enviado!", "Sua proposta foi enviada com sucesso.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Super Like!"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Super Like</strong> permite que você envie uma mensagem
            personalizada junto com uma proposta de produto específica. Isso
            aumenta suas chances de match!
          </p>
        </div>

        <Select
          id="selectedProductOffer"
          name="selectedProductOffer"
          value={selectedProductOffer?.toString() || ""}
          onChange={(e) =>
            setSelectedProductOffer(parseInt(e.target.value) || null)
          }
          options={myProducts.map((produto) => ({
            value: produto.id,
            label: `${produto.nome} - R$ ${produto.preco.toFixed(2)}`,
          }))}
          label="Qual produto você quer oferecer?"
          placeholder="Selecione um produto"
        />

        <Textarea
          id="superLikeMessage"
          name="superLikeMessage"
          value={superLikeMessage}
          onChange={(e) => setSuperLikeMessage(e.target.value)}
          placeholder="Escreva uma mensagem personalizada explicando por que você quer fazer essa troca..."
          label="Sua mensagem"
          rows={4}
          maxLength={500}
        />

        <div className="text-xs text-gray-500 text-right">
          {superLikeMessage.length}/500 caracteres
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isInteracting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSuperLike}
            disabled={
              !selectedProductOffer || !superLikeMessage.trim() || isInteracting
            }
            loading={isInteracting}
          >
            {isInteracting ? "Enviando..." : "Enviar Super Like"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
