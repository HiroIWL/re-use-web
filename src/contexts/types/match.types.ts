import { User } from "./auth.types";
import { Match } from "./product.types";

export interface Message {
  id: number;
  conteudo: string;
  criadoEm: string;
  usuario: User;
  deUsuario: boolean;
  idMatch: number;
}

export interface ChatData {
  match: Match;
  mensagens: Message[];
}

export interface SendMessageData {
  conteudo: string;
}

export interface MatchFilters {
  hasMessages?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface MatchState {
  matches: Match[];
  isLoadingMatches: boolean;

  activeChat: ChatData | null;
  isLoadingChat: boolean;

  isSendingMessage: boolean;

  filters: MatchFilters;
  lastUpdated: Date | null;

  isRefreshing: boolean;
}

export interface MatchContextType extends MatchState {
  loadMatches: () => Promise<void>;
  refreshMatches: () => Promise<void>;

  loadChat: (matchId: number) => Promise<void>;
  clearActiveChat: () => void;

  sendMessage: (matchId: number, data: SendMessageData) => Promise<Message>;

  getMatchById: (id: number) => Match | undefined;
  getLastMessage: (matchId: number) => Message | undefined;
  hasUnreadMessages: (matchId: number) => boolean;

  setFilters: (filters: MatchFilters) => void;
  clearFilters: () => void;

  addMatch: (match: Match) => void;
}
