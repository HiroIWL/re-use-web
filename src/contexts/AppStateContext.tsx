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
  AppContextType,
  AppState,
  ToastMessage,
  ModalConfig,
  Match,
  Product,
} from "./types";

const initialState: AppState = {
  activeModals: [],
  toasts: [],
};

type AppAction =
  | { type: "ADD_MODAL"; payload: ModalConfig }
  | { type: "REMOVE_MODAL"; payload: string }
  | { type: "CLEAR_MODALS" }
  | {
      type: "UPDATE_MODAL";
      payload: { id: string; updates: Partial<ModalConfig> };
    }
  | { type: "ADD_TOAST"; payload: ToastMessage }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "CLEAR_TOASTS" };

const generateId = () => Math.random().toString(36).substr(2, 9);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "ADD_MODAL":
      return {
        ...state,
        activeModals: [...state.activeModals, action.payload],
      };

    case "REMOVE_MODAL":
      return {
        ...state,
        activeModals: state.activeModals.filter(
          (modal) => modal.id !== action.payload
        ),
      };

    case "CLEAR_MODALS":
      return {
        ...state,
        activeModals: [],
      };

    case "UPDATE_MODAL":
      return {
        ...state,
        activeModals: state.activeModals.map((modal) =>
          modal.id === action.payload.id
            ? { ...modal, ...action.payload.updates }
            : modal
        ),
      };

    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };

    case "CLEAR_TOASTS":
      return {
        ...state,
        toasts: [],
      };

    default:
      return state;
  }
};

const AppStateContext = createContext<AppContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};

    state.toasts.forEach((toast) => {
      if (toast.duration && !timeouts[toast.id]) {
        timeouts[toast.id] = setTimeout(() => {
          dispatch({ type: "REMOVE_TOAST", payload: toast.id });
          delete timeouts[toast.id];
        }, toast.duration);
      }
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [state.toasts]);

  const openModal = useCallback((config: Omit<ModalConfig, "id">): string => {
    const id = generateId();
    const modal: ModalConfig = { ...config, id };
    dispatch({ type: "ADD_MODAL", payload: modal });
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    dispatch({ type: "REMOVE_MODAL", payload: id });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: "CLEAR_MODALS" });
  }, []);

  const updateModal = useCallback(
    (id: string, updates: Partial<ModalConfig>) => {
      dispatch({ type: "UPDATE_MODAL", payload: { id, updates } });
    },
    []
  );

  const showMatchModal = useCallback(
    (matchData: Match) => {
      openModal({
        type: "match",
        title: "É um MATCH!",
        data: matchData as unknown as Record<string, unknown>,
        size: "lg",
        showCloseButton: true,
      });
    },
    [openModal]
  );

  const showSuperLikeModal = useCallback(
    (productId: number, myProducts: Product[]) => {
      openModal({
        type: "superlike",
        title: "Super Like!",
        data: { productId, myProducts },
        size: "md",
        showCloseButton: true,
      });
    },
    [openModal]
  );

  const showToast = useCallback((toast: Omit<ToastMessage, "id">): string => {
    const id = generateId();
    const toastMessage: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    dispatch({ type: "ADD_TOAST", payload: toastMessage });
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  }, []);

  const clearAllToasts = useCallback(() => {
    dispatch({ type: "CLEAR_TOASTS" });
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "error", title, message, duration: 8000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "warning", title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "info", title, message });
    },
    [showToast]
  );

  const contextValue: AppContextType = {
    ...state,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    showMatchModal,
    showSuperLikeModal,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppContextType {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error("useAppState deve ser usado dentro de um AppStateProvider");
  }

  return context;
}
