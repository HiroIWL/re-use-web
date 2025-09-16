'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  ProductContextType, 
  ProductState, 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductFilters, 
  Match 
} from './types';
import { useAuthContext } from './AuthContext';

const initialState: ProductState = {
  swipeProducts: [],
  currentSwipeIndex: 0,
  isLoadingSwipe: false,
  myProducts: [],
  isLoadingMyProducts: false,
  filters: {},
  hasMoreProducts: true,
  isInteracting: false,
  matches: [],
  isLoadingMatches: false,
};
type ProductAction =
  | { type: 'SET_LOADING_SWIPE'; payload: boolean }
  | { type: 'SET_LOADING_MY_PRODUCTS'; payload: boolean }
  | { type: 'SET_LOADING_MATCHES'; payload: boolean }
  | { type: 'SET_INTERACTING'; payload: boolean }
  | { type: 'SET_SWIPE_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_SWIPE_PRODUCTS'; payload: Product[] }
  | { type: 'SET_MY_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_MY_PRODUCT'; payload: Product }
  | { type: 'UPDATE_MY_PRODUCT'; payload: { id: number; product: Product } }
  | { type: 'REMOVE_MY_PRODUCT'; payload: number }
  | { type: 'SET_MATCHES'; payload: Match[] }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'REMOVE_CURRENT_PRODUCT' }
  | { type: 'NEXT_PRODUCT' }
  | { type: 'SET_FILTERS'; payload: ProductFilters }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_HAS_MORE'; payload: boolean };

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'SET_LOADING_SWIPE':
      return { ...state, isLoadingSwipe: action.payload };
    
    case 'SET_LOADING_MY_PRODUCTS':
      return { ...state, isLoadingMyProducts: action.payload };
    
    case 'SET_LOADING_MATCHES':
      return { ...state, isLoadingMatches: action.payload };
    
    case 'SET_INTERACTING':
      return { ...state, isInteracting: action.payload };
    
    case 'SET_SWIPE_PRODUCTS':
      return { 
        ...state, 
        swipeProducts: action.payload,
        currentSwipeIndex: 0 
      };
    
    case 'ADD_SWIPE_PRODUCTS':
      return { 
        ...state, 
        swipeProducts: [...state.swipeProducts, ...action.payload] 
      };
    
    case 'SET_MY_PRODUCTS':
      return { ...state, myProducts: action.payload };
    
    case 'ADD_MY_PRODUCT':
      return { 
        ...state, 
        myProducts: [action.payload, ...state.myProducts] 
      };
    
    case 'UPDATE_MY_PRODUCT':
      return {
        ...state,
        myProducts: state.myProducts.map(p => 
          p.id === action.payload.id ? action.payload.product : p
        )
      };
    
    case 'REMOVE_MY_PRODUCT':
      return {
        ...state,
        myProducts: state.myProducts.filter(p => p.id !== action.payload)
      };
    
    case 'SET_MATCHES':
      return { ...state, matches: action.payload };
    
    case 'ADD_MATCH':
      return { 
        ...state, 
        matches: [action.payload, ...state.matches] 
      };
    
    case 'SET_CURRENT_INDEX':
      return { ...state, currentSwipeIndex: action.payload };
    
    case 'REMOVE_CURRENT_PRODUCT':
      const newProducts = state.swipeProducts.filter((_, index) => index !== state.currentSwipeIndex);
      const newIndex = state.currentSwipeIndex >= newProducts.length && newProducts.length > 0 
        ? newProducts.length - 1 
        : state.currentSwipeIndex;
      return { 
        ...state, 
        swipeProducts: newProducts,
        currentSwipeIndex: Math.max(0, newIndex)
      };
    
    case 'NEXT_PRODUCT':
      return { 
        ...state, 
        currentSwipeIndex: Math.min(state.currentSwipeIndex + 1, state.swipeProducts.length - 1) 
      };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    
    case 'SET_HAS_MORE':
      return { ...state, hasMoreProducts: action.payload };
    
    default:
      return state;
  }
};
const ProductContext = createContext<ProductContextType | undefined>(undefined);
interface ProductProviderProps {
  children: ReactNode;
}
export function ProductProvider({ children }: ProductProviderProps) {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const { authenticatedFetch, isAuthenticated } = useAuthContext();

  const loadSwipeProducts = useCallback(async (filters?: ProductFilters) => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_SWIPE', payload: true });

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limite', '20');
      
      if (filters?.categoria) {
        queryParams.append('categoria', filters.categoria.toString());
      }
      if (filters?.precoMin) {
        queryParams.append('precoMinimo', filters.precoMin.toString());
      }
      if (filters?.precoMax) {
        queryParams.append('precoMaximo', filters.precoMax.toString());
      }
      if (filters?.busca) {
        queryParams.append('busca', filters.busca);
      }

      const response = await authenticatedFetch(`/api/reuse/products?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_SWIPE_PRODUCTS', payload: data.data?.produtos || [] });
        dispatch({ type: 'SET_HAS_MORE', payload: (data.data?.produtos || []).length === 20 });
        
        if (filters) {
          dispatch({ type: 'SET_FILTERS', payload: filters });
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos para swipe:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_SWIPE', payload: false });
    }
  }, [authenticatedFetch, isAuthenticated]);

  const loadMyProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_MY_PRODUCTS', payload: true });

    try {
      const response = await authenticatedFetch('/api/products');

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_MY_PRODUCTS', payload: data.data?.produtos || [] });
      }
    } catch (error) {
      console.error('Erro ao carregar meus produtos:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MY_PRODUCTS', payload: false });
    }
  }, [authenticatedFetch, isAuthenticated]);

  const loadMoreSwipeProducts = useCallback(async () => {
    if (!isAuthenticated || !state.hasMoreProducts || state.isLoadingSwipe) return;

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limite', '20');
      queryParams.append('offset', state.swipeProducts.length.toString());
      
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await authenticatedFetch(`/api/reuse/products?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'ADD_SWIPE_PRODUCTS', payload: data.data?.produtos || [] });
        dispatch({ type: 'SET_HAS_MORE', payload: (data.data?.produtos || []).length === 20 });
      }
    } catch (error) {
      console.error('Erro ao carregar mais produtos:', error);
    }
  }, [authenticatedFetch, isAuthenticated, state.hasMoreProducts, state.isLoadingSwipe, state.swipeProducts.length, state.filters]);

  const refreshSwipeProducts = useCallback(async () => {
    await loadSwipeProducts(state.filters);
  }, [loadSwipeProducts, state.filters]);

  const createProduct = useCallback(async (data: CreateProductData): Promise<Product> => {
    if (!isAuthenticated) throw new Error('Usuário não autenticado');

    const response = await authenticatedFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar produto');
    }

    const product = await response.json();
    dispatch({ type: 'ADD_MY_PRODUCT', payload: product });
    
    return product;
  }, [authenticatedFetch, isAuthenticated]);

  const updateProduct = useCallback(async (id: number, data: UpdateProductData): Promise<Product> => {
    if (!isAuthenticated) throw new Error('Usuário não autenticado');

    const response = await authenticatedFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar produto');
    }

    const product = await response.json();
    dispatch({ type: 'UPDATE_MY_PRODUCT', payload: { id, product } });
    
    return product;
  }, [authenticatedFetch, isAuthenticated]);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error('Usuário não autenticado');

    const response = await authenticatedFetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar produto');
    }

    dispatch({ type: 'REMOVE_MY_PRODUCT', payload: id });
  }, [authenticatedFetch, isAuthenticated]);


  const checkForNewMatches = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const response = await authenticatedFetch('/api/reuse/matches');
      if (response.ok) {
        const data = await response.json();
        const newMatches = data.data?.matches || [];
        
        const currentMatchIds = state.matches.map(match => match.id);
        const newMatchesFound = newMatches.filter((match: Match) => 
          !currentMatchIds.includes(match.id)
        );

        if (newMatchesFound.length > 0) {
          newMatchesFound.forEach((match: Match) => {
            dispatch({ type: 'ADD_MATCH', payload: match });
          });
          
          if (newMatchesFound[0]) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('showMatchModal', { 
                detail: newMatchesFound[0] 
              }));
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar matches:', error);
    }
  }, [authenticatedFetch, isAuthenticated, state.matches]);

  const likeProduct = useCallback(async (productId: number): Promise<void> => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });
      return;
    }
    
    dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });

    setTimeout(async () => {
      try {
        const response = await authenticatedFetch('/api/reuse/like', {
          method: 'POST',
          body: JSON.stringify({ idProduto: productId }),
        });

        if (!response.ok) {
          throw new Error('Erro ao curtir produto');
        }

        await checkForNewMatches();
      } catch (error) {
        console.error('Erro ao curtir produto (ignorado):', error);
      }
    }, 0);
  }, [authenticatedFetch, isAuthenticated, checkForNewMatches]);
  
  const dislikeProduct = useCallback(async (productId: number): Promise<void> => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });
      return;
    }
    
    dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });

    setTimeout(async () => {
      try {
        const response = await authenticatedFetch('/api/reuse/dislike', {
          method: 'POST',
          body: JSON.stringify({ idProduto: productId }),
        });

        if (!response.ok) {
          throw new Error('Erro ao rejeitar produto');
        }
      } catch (error) {
        console.error('Erro ao dar dislike (ignorado):', error);
      }
    }, 0);
  }, [authenticatedFetch, isAuthenticated]);

  const superLikeProduct = useCallback(async (productId: number, mensagem: string, idProdutoOfertado?: number): Promise<void> => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });
      return;
    }
    
    dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });

    setTimeout(async () => {
      try {
        const response = await authenticatedFetch('/api/reuse/superlike', {
          method: 'POST',
          body: JSON.stringify({
            idProduto: productId,
            mensagem,
            idProdutoOfertado
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao super curtir produto');
        }

        await checkForNewMatches();
      } catch (error) {
        console.error('Erro ao dar super like (ignorado):', error);
      }
    }, 0);
  }, [authenticatedFetch, isAuthenticated, checkForNewMatches]);

  const nextProduct = useCallback(() => {
    dispatch({ type: 'NEXT_PRODUCT' });
  }, []);

  const removeCurrentProduct = useCallback(() => {
    dispatch({ type: 'REMOVE_CURRENT_PRODUCT' });
  }, []);

  const setFilters = useCallback((filters: ProductFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const loadMatches = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING_MATCHES', payload: true });

    try {
      const response = await authenticatedFetch('/api/reuse/matches');

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_MATCHES', payload: data.data?.matches || [] });
      }
    } catch (error) {
      console.error('Erro ao carregar matches:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MATCHES', payload: false });
    }
  }, [authenticatedFetch, isAuthenticated]);

  const contextValue: ProductContextType = {
    ...state,
    loadSwipeProducts,
    loadMyProducts,
    loadMoreSwipeProducts,
    refreshSwipeProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    likeProduct,
    dislikeProduct,
    superLikeProduct,
    nextProduct,
    removeCurrentProduct,
    setFilters,
    clearFilters,
    loadMatches,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext);
  
  if (context === undefined) {
    throw new Error('useProductContext deve ser usado dentro de um ProductProvider');
  }
  
  return context;
}
