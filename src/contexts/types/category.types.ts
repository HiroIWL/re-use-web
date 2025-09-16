import { Category } from "./product.types";

export interface CategoryFilters {
  busca?: string;
  tipo?: "populares" | "interessantes";
  limite?: number;
}

export interface UserInterest {
  idUsuario: number;
  idCategoria: number;
}

export interface CategoryState {
  categories: Category[];
  isLoadingCategories: boolean;

  userInterests: number[];
  isLoadingUserInterests: boolean;

  filters: CategoryFilters;
  lastUpdated: Date | null;

  isUpdatingInterests: boolean;
}

export interface CategoryContextType extends CategoryState {
  loadCategories: (filters?: CategoryFilters) => Promise<void>;
  refreshCategories: () => Promise<void>;

  searchCategories: (busca: string) => Promise<Category[]>;
  getPopularCategories: (limite?: number) => Promise<Category[]>;
  getInterestingCategories: (limite?: number) => Promise<Category[]>;

  loadUserInterests: () => Promise<void>;
  addUserInterest: (categoryId: number) => Promise<void>;
  removeUserInterest: (categoryId: number) => Promise<void>;
  updateUserInterests: (categoryIds: number[]) => Promise<void>;
  toggleUserInterest: (categoryId: number) => Promise<void>;

  getCategoryById: (id: number) => Category | undefined;
  isCategoryOfInterest: (categoryId: number) => boolean;

  setFilters: (filters: CategoryFilters) => void;
  clearFilters: () => void;
}
