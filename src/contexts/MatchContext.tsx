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
  MatchContextType,
  MatchState,
  Match,
  Message,
  ChatData,
  SendMessageData,
  MatchFilters,
} from "./types";
import { useAuthContext } from "./AuthContext";

const initialState: MatchState = {
  matches: [],
  isLoadingMatches: false,
  activeChat: null,
  isLoadingChat: false,
  isSendingMessage: false,
  filters: {},
  lastUpdated: null,
  isRefreshing: false,
};

type MatchAction =
  | { type: "SET_LOADING_MATCHES"; payload: boolean }
  | { type: "SET_LOADING_CHAT"; payload: boolean }
  | { type: "SET_SENDING_MESSAGE"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_MATCHES"; payload: Match[] }
  | { type: "ADD_MATCH"; payload: Match }
  | { type: "UPDATE_MATCH"; payload: { id: number; match: Match } }
  | { type: "SET_ACTIVE_CHAT"; payload: ChatData | null }
  | { type: "ADD_MESSAGE_TO_ACTIVE_CHAT"; payload: Message }
  | {
      type: "UPDATE_LAST_MESSAGE";
      payload: { matchId: number; message: Message };
    }
  | { type: "SET_FILTERS"; payload: MatchFilters }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_LAST_UPDATED"; payload: Date };

const matchReducer = (state: MatchState, action: MatchAction): MatchState => {
  switch (action.type) {
    case "SET_LOADING_MATCHES":
      return { ...state, isLoadingMatches: action.payload };

    case "SET_LOADING_CHAT":
      return { ...state, isLoadingChat: action.payload };

    case "SET_SENDING_MESSAGE":
      return { ...state, isSendingMessage: action.payload };

    case "SET_REFRESHING":
      return { ...state, isRefreshing: action.payload };

    case "SET_MATCHES":
      return {
        ...state,
        matches: action.payload,
        lastUpdated: new Date(),
      };

    case "ADD_MATCH":
      return {
        ...state,
        matches: [action.payload, ...state.matches],
      };

    case "UPDATE_MATCH":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === action.payload.id ? action.payload.match : match
        ),
      };

    case "SET_ACTIVE_CHAT":
      return { ...state, activeChat: action.payload };

    case "ADD_MESSAGE_TO_ACTIVE_CHAT":
      if (!state.activeChat) return state;
      return {
        ...state,
        activeChat: {
          ...state.activeChat,
          mensagens: [...state.activeChat.mensagens, action.payload],
        },
      };

    case "UPDATE_LAST_MESSAGE":
      const { matchId, message } = action.payload;
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === matchId
            ? {
                ...match,
                ultimaMensagem: {
                  id: message.id,
                  conteudo: message.conteudo,
                  criadoEm: message.criadoEm,
                  deUsuario: message.deUsuario,
                },
              }
            : match
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

const MatchContext = createContext<MatchContextType | undefined>(undefined);

interface MatchProviderProps {
  children: ReactNode;
}

export function MatchProvider({ children }: MatchProviderProps) {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const { authenticatedFetch, isAuthenticated, user } = useAuthContext();

  const loadMatches = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch({ type: "SET_LOADING_MATCHES", payload: true });

    try {
      const queryParams = new URLSearchParams();

      if (state.filters.hasMessages !== undefined) {
        queryParams.append("hasMessages", state.filters.hasMessages.toString());
      }
      if (state.filters.dateFrom) {
        queryParams.append("dateFrom", state.filters.dateFrom);
      }
      if (state.filters.dateTo) {
        queryParams.append("dateTo", state.filters.dateTo);
      }

      const response = await authenticatedFetch(
        `/api/reuse/matches?${queryParams}`
      );

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_MATCHES", payload: data.data?.matches || [] });
      }
    } catch (error) {
      console.error("Erro ao carregar matches:", error);
    } finally {
      dispatch({ type: "SET_LOADING_MATCHES", payload: false });
    }
  }, [authenticatedFetch, isAuthenticated, state.filters]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMatches();
    } else {
      dispatch({ type: "SET_MATCHES", payload: [] });
      dispatch({ type: "SET_ACTIVE_CHAT", payload: null });
    }
  }, [isAuthenticated, user, loadMatches]);

  const refreshMatches = useCallback(async () => {
    dispatch({ type: "SET_REFRESHING", payload: true });
    try {
      await loadMatches();
    } finally {
      dispatch({ type: "SET_REFRESHING", payload: false });
    }
  }, [loadMatches]);

  const loadChat = useCallback(
    async (matchId: number) => {
      if (!isAuthenticated) return;

      dispatch({ type: "SET_LOADING_CHAT", payload: true });

      try {
        const response = await authenticatedFetch(`/api/chat/${matchId}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar chat");
        }

        const data = await response.json();
        const chatData: ChatData = {
          match: data.data?.mensagens?.match,
          mensagens: data.data?.mensagens?.mensagens || [],
        };

        dispatch({ type: "SET_ACTIVE_CHAT", payload: chatData });
      } catch (error) {
        console.error("Erro ao carregar chat:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING_CHAT", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated]
  );

  const clearActiveChat = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_CHAT", payload: null });
  }, []);

  const sendMessage = useCallback(
    async (matchId: number, data: SendMessageData): Promise<Message> => {
      if (!isAuthenticated) throw new Error("Usuário não autenticado");

      dispatch({ type: "SET_SENDING_MESSAGE", payload: true });

      try {
        const response = await authenticatedFetch(`/api/chat/${matchId}`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao enviar mensagem");
        }

        const result = await response.json();
        const newMessage: Message = result.data?.mensagem;

        if (state.activeChat && state.activeChat.match.id === matchId) {
          dispatch({ type: "ADD_MESSAGE_TO_ACTIVE_CHAT", payload: newMessage });
        }

        dispatch({
          type: "UPDATE_LAST_MESSAGE",
          payload: { matchId, message: newMessage },
        });

        return newMessage;
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_SENDING_MESSAGE", payload: false });
      }
    },
    [authenticatedFetch, isAuthenticated, state.activeChat]
  );

  const getMatchById = useCallback(
    (id: number): Match | undefined => {
      return state.matches.find((match) => match.id === id);
    },
    [state.matches]
  );

  const getLastMessage = useCallback(
    (matchId: number): Message | undefined => {
      const match = getMatchById(matchId);
      if (!match?.ultimaMensagem) return undefined;

      return {
        id: match.ultimaMensagem.id || 0,
        conteudo: match.ultimaMensagem.conteudo,
        criadoEm: match.ultimaMensagem.criadoEm,
        usuario: match.outroUsuario,
        deUsuario: match.ultimaMensagem.deUsuario,
        idMatch: matchId,
      };
    },
    [getMatchById]
  );

  const hasUnreadMessages = useCallback((matchId: number): boolean => {
    return false;
  }, []);

  const setFilters = useCallback((filters: MatchFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);


  const addMatch = useCallback((match: Match) => {
    dispatch({ type: "ADD_MATCH", payload: match });
  }, []);

  const contextValue: MatchContextType = {
    ...state,
    loadMatches,
    refreshMatches,
    loadChat,
    clearActiveChat,
    sendMessage,
    getMatchById,
    getLastMessage,
    hasUnreadMessages,
    setFilters,
    clearFilters,
    addMatch,
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchContext(): MatchContextType {
  const context = useContext(MatchContext);

  if (context === undefined) {
    throw new Error(
      "useMatchContext deve ser usado dentro de um MatchProvider"
    );
  }

  return context;
}
