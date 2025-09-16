'use client';

import { useEffect } from 'react';
import { 
  PageLayout, 
  SwipeContainer, 
  ActionButtons, 
  EmptyState,
  Button
} from '@/components';
import { useAuthContext, useProductContext, useAppState } from '@/contexts';


export default function Swipe() {
  const { user, isLoading: authLoading, redirectToLogin } = useAuthContext();
  const {
    swipeProducts,
    currentSwipeIndex,
    isLoadingSwipe,
    myProducts,
    loadSwipeProducts,
    likeProduct,
    dislikeProduct,
    isInteracting
  } = useProductContext();
  const { showMatchModal, showSuperLikeModal } = useAppState();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      redirectToLogin();
      return;
    }

    loadSwipeProducts();
  }, [user, authLoading, loadSwipeProducts, redirectToLogin]);

  useEffect(() => {
    const handleShowMatchModal = (event: CustomEvent) => {
      const matchData = event.detail;
      showMatchModal(matchData);
    };

    window.addEventListener('showMatchModal', handleShowMatchModal as EventListener);
    
    return () => {
      window.removeEventListener('showMatchModal', handleShowMatchModal as EventListener);
    };
  }, [showMatchModal]);

  const handleDislike = async () => {
    if (currentSwipeIndex >= swipeProducts.length || isInteracting) return;
    
    const produto = swipeProducts[currentSwipeIndex];
    await dislikeProduct(produto.id);
  };

  const handleLike = async () => {
    if (currentSwipeIndex >= swipeProducts.length || isInteracting) return;
    
    const produto = swipeProducts[currentSwipeIndex];
    await likeProduct(produto.id);
  };

  const handleSuperLike = () => {
    if (currentSwipeIndex >= swipeProducts.length || isInteracting) return;
    
    const produto = swipeProducts[currentSwipeIndex];
    showSuperLikeModal(produto.id, myProducts);
  };


    const navigation = [
        { label: 'Início', href: '/swipe', isActive: true },
        { label: 'Matches', href: '/matches' },
        { label: 'Meus Produtos', href: '/my-products' }
    ];

  if (swipeProducts.length === 0 && !isLoadingSwipe) {
    return (
      <PageLayout
        user={user}
        navigation={navigation}
        isLoading={isLoadingSwipe}
        loadingMessage="Carregando produtos..."
        contentClassName="flex items-center justify-center"
      >
        <EmptyState
          title="Não há mais produtos!"
          description="Você viu todos os produtos disponíveis."
          actionLabel="Recarregar"
          onAction={() => loadSwipeProducts()}
        />
      </PageLayout>
    );
  }

  if (currentSwipeIndex >= swipeProducts.length && swipeProducts.length > 0) {
    return (
      <PageLayout
        user={user}
        navigation={navigation}
        isLoading={isLoadingSwipe}
        loadingMessage="Carregando produtos..."
        contentClassName="flex items-center justify-center"
      >
        <EmptyState
          title="Não há mais produtos!"
          description="Você viu todos os produtos disponíveis."
          actionLabel="Recarregar"
          onAction={() => loadSwipeProducts()}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      user={user}
      navigation={navigation}
      isLoading={isLoadingSwipe}
      loadingMessage="Carregando produtos..."
      contentClassName="flex flex-col items-center justify-center p-4"
    >      
      <div className="w-full max-w-sm h-96 mb-16 relative">
        <SwipeContainer
          products={swipeProducts}
          currentIndex={currentSwipeIndex}
          onSwipeLeft={handleDislike}
          onSwipeRight={handleLike}
          className="h-full"
        />
        
      </div>

      <ActionButtons
        onDislike={handleDislike}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
        className="mt-8"
      />

      <Button
        onClick={() => window.location.href = '/products/add'}
        fullWidth
        size="lg"
        className="max-w-sm mt-8"
      >
        Novo produto
      </Button>

    </PageLayout>
  );
}
