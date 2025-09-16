import React from "react";
import { Match, Product } from "./product.types";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalConfig {
  id: string;
  type: "match" | "superlike" | "confirmation" | "custom";
  title: string;
  content?: React.ReactNode;
  data?: Record<string, unknown>;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
  onClose?: () => void;
  actions?: Array<{
    label: string;
    variant?: "primary" | "secondary" | "danger" | "outline";
    onClick: () => void;
    loading?: boolean;
  }>;
}

export interface AppState {
  activeModals: ModalConfig[];

  toasts: ToastMessage[];
}

export interface AppContextType extends AppState {
  openModal: (config: Omit<ModalConfig, "id">) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;

  showMatchModal: (matchData: Match) => void;
  showSuperLikeModal: (productId: number, myProducts: Product[]) => void;

  showToast: (toast: Omit<ToastMessage, "id">) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;

  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}
