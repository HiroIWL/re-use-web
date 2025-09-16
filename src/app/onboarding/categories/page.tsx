"use client";

import { useState, useEffect } from "react";
import { Button, Logo } from "@/components";
import { useAuthContext, useCategoryContext } from "@/contexts";

export default function Categories() {
  const {} = useAuthContext();
  const {
    categories,
    isLoadingCategories,
    loadCategories,
    updateUserInterests,
  } = useCategoryContext();

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user && !token) {
      window.location.href = "/";
      return;
    }

    loadCategories();
  }, [loadCategories]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      await updateUserInterests(selectedCategories);
      window.location.href = "/products/add";
    } catch (error) {
      console.error("Erro ao salvar categorias:", error);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selecione as categorias de produto que lhe interessam
        </h1>
        <p className="text-gray-600 text-center">
          Selecione pelo menos 2 categorias de seu interesse
        </p>
      </div>

      <div className="w-full max-w-md mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`px-4 py-2 rounded-full border-2 transition-all ${
                selectedCategories.includes(category.id)
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
              }`}
            >
              {category.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md mb-8">
        <p className="text-center text-gray-600">
          {selectedCategories.length} categoria
          {selectedCategories.length !== 1 ? "s" : ""} selecionada
          {selectedCategories.length !== 1 ? "s" : ""}
          {selectedCategories.length < 2 && (
            <span className="text-red-500 ml-2">(mínimo 2)</span>
          )}
        </p>
      </div>

      <div className="w-full max-w-md">
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
