export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  categorias?: Array<{
    id: number;
    nome: string;
    descricao?: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  redirectToLogin: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  getAuthToken: () => string | null;
  getAuthHeaders: () => Record<string, string>;

  updateUser: (user: User) => void;
}
