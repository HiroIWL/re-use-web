"use client";

import { useState, useEffect } from "react";
import {
  PageLayout,
  Input,
  Select,
  Textarea,
  Button,
  PhotoPlaceholder,
} from "@/components";
import {
  useAuthContext,
  useCategoryContext,
  useProductContext,
} from "@/contexts";

export default function AdicionarProduto() {
  const { user } = useAuthContext();
  const { categories, isLoadingCategories, loadCategories } =
    useCategoryContext();
  const { createProduct } = useProductContext();

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco: "",
    descricao: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const tempUser = localStorage.getItem("tempUser");

    if (tempUser) {
      setIsOnboarding(true);
    } else if (!user) {
      window.location.href = "/";
      return;
    }

    loadCategories();
  }, [user, loadCategories]);

  const applyPriceMask = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    const cents = parseInt(numbers, 10);

    const reais = cents / 100;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(reais);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const processedValue = name === "preco" ? applyPriceMask(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const priceValue = formData.preco.replace(/\D/g, "");
      const priceInReais = parseInt(priceValue, 10) / 100;

      await createProduct({
        nome: formData.nome,
        descricao: formData.descricao,
        preco: priceInReais,
        idCategoria: parseInt(formData.categoria),
      });

      if (isOnboarding) {
        const tempUser = localStorage.getItem("tempUser");
        localStorage.removeItem("tempUser");
        localStorage.setItem("user", tempUser || "{}");
      } else {
        alert("Produto cadastrado com sucesso!");
        setFormData({
          nome: "",
          categoria: "",
          preco: "",
          descricao: "",
        });
      }

      window.location.href = "/swipe";
    } catch (error: unknown) {
      console.error("Erro ao cadastrar produto:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao cadastrar produto";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isOnboarding) {
      window.location.href = "/onboarding/categories";
    } else {
      window.location.href = "/swipe";
    }
  };

  const getTitle = () => {
    return isOnboarding ? "Seu Primeiro Produto" : "Cadastrar Produto";
  };

  const getButtonText = () => {
    return isOnboarding ? "Continuar" : "Cadastrar Produto";
  };

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mb-6">
          <PhotoPlaceholder currentPhoto={0} />
        </div>

        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome do produto"
              label="Título"
              error={errors.nome}
            />

            <Select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.nome,
              }))}
              label="Categoria"
              placeholder="Selecione uma categoria"
              error={errors.categoria}
            />

            <Input
              id="preco"
              name="preco"
              type="text"
              value={formData.preco}
              onChange={handleInputChange}
              placeholder="R$ 0,00"
              label="Preço (R$)"
              error={errors.preco}
            />

            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva o produto, suas características, estado de conservação, etc."
              label="Adicione descrição"
              rows={4}
              error={errors.descricao}
            />

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            >
              {getButtonText()}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      user={user}
      showBackButton
      onBackClick={handleBack}
      backLabel="Voltar"
      contentClassName="p-4"
      isLoading={isLoadingCategories}
      loadingMessage="Carregando categorias..."
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {getTitle()}
        </h1>

        <PhotoPlaceholder className="mb-6" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite o nome do produto"
            label="Título"
            error={errors.nome}
          />

          <Select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.nome,
            }))}
            label="Categoria"
            placeholder="Selecione uma categoria"
            error={errors.categoria}
          />

          <Input
            id="preco"
            name="preco"
            type="text"
            value={formData.preco}
            onChange={handleInputChange}
            placeholder="R$ 0,00"
            label="Preço (R$)"
            error={errors.preco}
          />

          <Textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            placeholder="Descreva o produto, suas características, estado de conservação, etc."
            label="Adicione descrição"
            rows={4}
            error={errors.descricao}
          />

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            {getButtonText()}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
