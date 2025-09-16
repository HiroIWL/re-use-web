import { User } from "./auth.types";

export interface Category {
  id: number;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  totalProdutos?: number;
  totalUsuarios?: number;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  idCategoria: number;
  categoria: Category;
  idUsuario: number;
  usuario?: User;
  ativo?: boolean;
  criadoEm: string;
  atualizadoEm?: string;
  fotos?: string[];
  tags?: string[];
  estatisticas?: {
    likes: number;
    dislikes: number;
    superLikes: number;
  };
}

export interface CreateProductData {
  nome: string;
  descricao: string;
  preco: number;
  idCategoria: number;
  fotos?: string[];
  tags?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  ativo?: boolean;
}

export interface ProductFilters {
  categoria?: number;
  precoMin?: number;
  precoMax?: number;
  busca?: string;
  ativo?: boolean;
  ordenacao?: "recentes" | "preco_asc" | "preco_desc" | "nome";
  limite?: number;
  offset?: number;
}

export interface InteractionData {
  idUsuario: number;
  idProduto: number;
  mensagem?: string;
  idProdutoOfertado?: number;
}

export interface Match {
  id: number;
  outroUsuario: User;
  produto1: Product;
  produto2: Product;
  criadoEm: string;
  ultimaMensagem?: {
    id?: number;
    conteudo: string;
    criadoEm: string;
    deUsuario: boolean;
  } | null;
}

export interface ProductState {
  swipeProducts: Product[];
  currentSwipeIndex: number;
  isLoadingSwipe: boolean;

  myProducts: Product[];
  isLoadingMyProducts: boolean;

  filters: ProductFilters;
  hasMoreProducts: boolean;

  isInteracting: boolean;

  matches: Match[];
  isLoadingMatches: boolean;
}

export interface ProductContextType extends ProductState {
  loadSwipeProducts: (filters?: ProductFilters) => Promise<void>;
  loadMyProducts: () => Promise<void>;
  loadMoreSwipeProducts: () => Promise<void>;
  refreshSwipeProducts: () => Promise<void>;

  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (id: number, data: UpdateProductData) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;

  likeProduct: (productId: number) => Promise<void>;
  dislikeProduct: (productId: number) => Promise<void>;
  superLikeProduct: (
    productId: number,
    mensagem: string,
    idProdutoOfertado?: number
  ) => Promise<void>;

  loadMatches: () => Promise<void>;

  nextProduct: () => void;
  removeCurrentProduct: () => void;

  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
}
