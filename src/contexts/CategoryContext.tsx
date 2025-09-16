"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  CategoryContextType,
  CategoryState,
  Category,
  CategoryFilters,
} from "./types";
import { useAuthContext } from "./AuthContext";

const initialState: CategoryState = {
  categories: [],
  isLoadingCategories: false,
  userInterests: [],
  isLoadingUserInterests: false,
  filters: {},
  lastUpdated: null,
  isUpdatingInterests: false,
};

type CategoryAction =
  | { type: "SET_LOADING_CATEGORIES"; payload: boolean }
  | { type: "SET_LOADING_USER_INTERESTS"; payload: boolean }
  | { type: "SET_UPDATING_INTERESTS"; payload: boolean }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_USER_INTERESTS"; payload: number[] }
  | { type: "ADD_USER_INTEREST"; payload: number }
  | { type: "REMOVE_USER_INTEREST"; payload: number }
  | { type: "SET_FILTERS"; payload: CategoryFilters }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LAST_UPDATED"; payload: Date };

const categoryReducer = (
  state: CategoryState,
  action: CategoryAction
): CategoryState => {
  switch (action.type) {
    case "SET_LOADING_CATEGORIES":
      return { ...state, isLoadingCategories: action.payload };

    case "SET_LOADING_USER_INTERESTS":
      return { ...state, isLoadingUserInterests: action.payload };

    case "SET_UPDATING_INTERESTS":
      return { ...state, isUpdatingInterests: action.payload };

    case "SET_CATEGORIES":
      return {
        ...state,
        categories: action.payload,
        lastUpdated: new Date(),
      };

    case "SET_USER_INTERESTS":
      return { ...state, userInterests: action.payload };

    case "ADD_USER_INTEREST":
      if (state.userInterests.includes(action.payload)) return state;
      return {
        ...state,
        userInterests: [...state.userInterests, action.payload],
      };

    case "REMOVE_USER_INTEREST":
      return {
        ...state,
        userInterests: state.userInterests.filter(
          (id) => id !== action.payload
        ),
      };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "CLEAR_FILTERS":
      return { ...state, filters: {} };

    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload };

    default:
      return state;
  }
};

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);
  const { authenticatedFetch, isAuthenticated, user } = useAuthContext();

  const loadCategories = useCallback(
    async (filters?: CategoryFilters) => {
      dispatch({ type: "SET_LOADING_CATEGORIES", payload: true });

      try {
        const queryParams = new URLSearchParams();

        if (filters?.busca) {
          queryParams.append("busca", filters.busca);
        }
        if (filters?.tipo) {
          queryParams.append("tipo", filters.tipo);
        }
        if (filters?.limite) {
          queryParams.append("limite", filters.limite.toString());
        }

        const response = isAuthenticated
          ? await authenticatedFetch(`/api/categories?${queryParams}`)
          : await fetch(`/api/categories?${queryParams}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            });

        if (response.ok) {
          const data = await response.json();
          dispatch({
            type: "SET_CATEGORIES",
            payload: data.data?.categorias || [],
          });

          if (filters) {
            dispatch({ type: "SET_FILTERS", payload: filters });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        dispatch({ type: "SET_LOADING_CATEGORIES", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated]
  );

  const refreshCategories = useCallback(async () => {
    await loadCategories(state.filters);
  }, [loadCategories, state.filters]);

  const searchCategories = useCallback(
    async (busca: string): Promise<Category[]> => {
      if (!isAuthenticated) return [];

      try {
        const response = await authenticatedFetch(
          `/api/categories?busca=${encodeURIComponent(busca)}`
        );

        if (response.ok) {
          const data = await response.json();
          return data.data?.categorias || [];
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }

      return [];
    },
    [authenticatedFetch, isAuthenticated]
  );

  const getPopularCategories = useCallback(
    async (limite: number = 10): Promise<Category[]> => {
      if (!isAuthenticated) return [];

      try {
        const response = await authenticatedFetch(
          `/api/categories?tipo=populares&limite=${limite}`
        );

        if (response.ok) {
          const data = await response.json();
          return data.data?.categorias || [];
        }
      } catch (error) {
        console.error("Erro ao carregar categorias populares:", error);
      }

      return [];
    },
    [authenticatedFetch, isAuthenticated]
  );

  const getInterestingCategories = useCallback(
    async (limite: number = 10): Promise<Category[]> => {
      if (!isAuthenticated) return [];

      try {
        const response = await authenticatedFetch(
          `/api/categories?tipo=interessantes&limite=${limite}`
        );

        if (response.ok) {
          const data = await response.json();
          return data.data?.categorias || [];
        }
      } catch (error) {
        console.error("Erro ao carregar categorias interessantes:", error);
      }

      return [];
    },
    [authenticatedFetch, isAuthenticated]
  );

  const loadUserInterests = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    dispatch({ type: "SET_LOADING_USER_INTERESTS", payload: true });

    try {
      if (user.categorias) {
        const interestIds = user.categorias.map((cat) => cat.id);
        dispatch({ type: "SET_USER_INTERESTS", payload: interestIds });
      }
    } catch (error) {
      console.error("Erro ao carregar interesses do usuário:", error);
    } finally {
      dispatch({ type: "SET_LOADING_USER_INTERESTS", payload: false });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserInterests();
    } else {
      dispatch({ type: "SET_USER_INTERESTS", payload: [] });
    }
  }, [isAuthenticated, user, loadUserInterests]);

  const addUserInterest = useCallback(
    async (categoryId: number): Promise<void> => {
      if (!isAuthenticated || state.userInterests.includes(categoryId)) return;

      dispatch({ type: "SET_UPDATING_INTERESTS", payload: true });

      try {
        const response = await authenticatedFetch("/api/users/interests", {
          method: "PUT",
          body: JSON.stringify({
            categorias: [...state.userInterests, categoryId],
          }),
        });

        if (response.ok) {
          dispatch({ type: "ADD_USER_INTEREST", payload: categoryId });
        } else {
          throw new Error("Erro ao adicionar interesse");
        }
      } catch (error) {
        console.error("Erro ao adicionar interesse:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_UPDATING_INTERESTS", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated, state.userInterests]
  );

  const removeUserInterest = useCallback(
    async (categoryId: number): Promise<void> => {
      if (!isAuthenticated || !state.userInterests.includes(categoryId)) return;

      dispatch({ type: "SET_UPDATING_INTERESTS", payload: true });

      try {
        const newInterests = state.userInterests.filter(
          (id) => id !== categoryId
        );

        const response = await authenticatedFetch("/api/users/interests", {
          method: "PUT",
          body: JSON.stringify({ categorias: newInterests }),
        });

        if (response.ok) {
          dispatch({ type: "REMOVE_USER_INTEREST", payload: categoryId });
        } else {
          throw new Error("Erro ao remover interesse");
        }
      } catch (error) {
        console.error("Erro ao remover interesse:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_UPDATING_INTERESTS", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated, state.userInterests]
  );

  const updateUserInterests = useCallback(
    async (categoryIds: number[]): Promise<void> => {
      if (!isAuthenticated) return;

      dispatch({ type: "SET_UPDATING_INTERESTS", payload: true });

      try {
        const response = await authenticatedFetch("/api/users/interests", {
          method: "PUT",
          body: JSON.stringify({ categorias: categoryIds }),
        });

        if (response.ok) {
          dispatch({ type: "SET_USER_INTERESTS", payload: categoryIds });
        } else {
          throw new Error("Erro ao atualizar interesses");
        }
      } catch (error) {
        console.error("Erro ao atualizar interesses:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_UPDATING_INTERESTS", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated]
  );

  const toggleUserInterest = useCallback(
    async (categoryId: number): Promise<void> => {
      if (state.userInterests.includes(categoryId)) {
        await removeUserInterest(categoryId);
      } else {
        await addUserInterest(categoryId);
      }
    },
    [state.userInterests, removeUserInterest, addUserInterest]
  );

  const getCategoryById = useCallback(
    (id: number): Category | undefined => {
      return state.categories.find((category) => category.id === id);
    },
    [state.categories]
  );

  const isCategoryOfInterest = useCallback(
    (categoryId: number): boolean => {
      return state.userInterests.includes(categoryId);
    },
    [state.userInterests]
  );

  const setFilters = useCallback((filters: CategoryFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const contextValue: CategoryContextType = {
    ...state,
    loadCategories,
    refreshCategories,
    searchCategories,
    getPopularCategories,
    getInterestingCategories,
    loadUserInterests,
    addUserInterest,
    removeUserInterest,
    updateUserInterests,
    toggleUserInterest,
    getCategoryById,
    isCategoryOfInterest,
    setFilters,
    clearFilters,
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext(): CategoryContextType {
  const context = useContext(CategoryContext);

  if (context === undefined) {
    throw new Error(
      "useCategoryContext deve ser usado dentro de um CategoryProvider"
    );
  }

  return context;
}
