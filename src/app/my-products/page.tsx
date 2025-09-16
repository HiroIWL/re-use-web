"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageLayout from "../../components/layout/PageLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useAuthContext, useProductContext } from "@/contexts";
import { useDateFormat } from "../../hooks/useDateFormat";

export default function MyProductsPage() {
  const { user, isLoading: authLoading, redirectToLogin } = useAuthContext();
  const { myProducts, isLoadingMyProducts, loadMyProducts } =
    useProductContext();
  const { formatarPreco } = useDateFormat();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      redirectToLogin();
      return;
    }

    loadMyProducts();
  }, [user, authLoading, loadMyProducts, redirectToLogin]);

  const handleCreateProduct = () => {
    router.push("/products/add");
  };

  const navigation = [
    { label: "Início", href: "/swipe" },
    { label: "Matches", href: "/matches" },
    { label: "Meus Produtos", href: "/my-products", isActive: true },
  ];

  if (isLoadingMyProducts) {
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
      <div className="space-y-6 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus produtos e veja quantas pessoas se interessaram
            </p>
          </div>
          {myProducts.length !== 0 ? (
            <Button
              onClick={handleCreateProduct}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + Criar Produto
            </Button>
          ) : (
            <></>
          )}
        </div>

        {myProducts.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Crie seu primeiro produto para começar a trocar!"
            actionLabel="Criar Produto"
            onAction={handleCreateProduct}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {myProducts.map((produto) => (
              <Card
                key={produto.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {produto.fotos && produto.fotos.length > 0 ? (
                      <Image
                        src={produto.fotos[0]}
                        alt={produto.nome}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm">Sem foto</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded">
                        {produto.categoria.nome}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-lg">
                      {produto.nome}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {produto.descricao}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatarPreco(produto.preco)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Likes: {produto.estatisticas?.likes || 0}</span>
                      <span>
                        Dislikes: {produto.estatisticas?.dislikes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
