export { AuthProvider, useAuthContext } from './AuthContext';
export { ProductProvider, useProductContext } from './ProductContext';
export { CategoryProvider, useCategoryContext } from './CategoryContext';
export { MatchProvider, useMatchContext } from './MatchContext';
export { AppStateProvider, useAppState } from './AppStateContext';
export type { 
  AuthContextType, 
  AuthState, 
  User, 
  Category, 
  LoginCredentials, 
  RegisterData,
  ProductContextType,
  ProductState,
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  InteractionData,
  Match,
  CategoryContextType,
  CategoryState,
  CategoryFilters,
  UserInterest,
  MatchContextType,
  MatchState,
  MatchFilters,
  Message,
  ChatData,
  SendMessageData,
  AppContextType,
  AppState,
  ToastMessage,
  ModalConfig
} from './types';
