import { ValidationRule } from "./types";
import { ApiResponseBuilder } from "./response";

export class ApiValidator {
  static validate(data: Record<string, unknown>, rules: ValidationRule[]) {
    for (const rule of rules) {
      const value = data[rule.field];
      const error = this.validateField(value, rule);

      if (error) {
        throw ApiResponseBuilder.validationError(rule.field, error);
      }
    }
  }

  private static validateField(
    value: unknown,
    rule: ValidationRule
  ): string | null {
    const { field, required, type, min, max, message } = rule;

    if (required && (value === undefined || value === null || value === "")) {
      return message || `${field} é obrigatório`;
    }

    if (!required && (value === undefined || value === null || value === "")) {
      return null;
    }

    if (type) {
      const typeError = this.validateType(value, type, field);
      if (typeError) return message || typeError;
    }

    if (min !== undefined) {
      const minError = this.validateMin(value, min, field, type);
      if (minError) return message || minError;
    }

    if (max !== undefined) {
      const maxError = this.validateMax(value, max, field, type);
      if (maxError) return message || maxError;
    }

    return null;
  }

  private static validateType(
    value: unknown,
    type: string,
    field: string
  ): string | null {
    switch (type) {
      case "string":
        if (typeof value !== "string") {
          return `${field} deve ser um texto`;
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          return `${field} deve ser um número válido`;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return `${field} deve ser um email válido`;
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          return `${field} deve ser uma lista`;
        }
        break;
    }

    return null;
  }

  private static validateMin(
    value: unknown,
    min: number,
    field: string,
    type?: string
  ): string | null {
    if (type === "string" && typeof value === "string" && value.length < min) {
      return `${field} deve ter pelo menos ${min} caracteres`;
    }

    if (type === "number" && Number(value) < min) {
      return `${field} deve ser maior que ${min}`;
    }

    if (type === "array" && Array.isArray(value) && value.length < min) {
      return `${field} deve ter pelo menos ${min} itens`;
    }

    return null;
  }

  private static validateMax(
    value: unknown,
    max: number,
    field: string,
    type?: string
  ): string | null {
    if (type === "string" && typeof value === "string" && value.length > max) {
      return `${field} deve ter no máximo ${max} caracteres`;
    }

    if (type === "number" && Number(value) > max) {
      return `${field} deve ser menor que ${max}`;
    }

    if (type === "array" && Array.isArray(value) && value.length > max) {
      return `${field} deve ter no máximo ${max} itens`;
    }

    return null;
  }

  static sanitizeString(value: string): string {
    return typeof value === "string" ? value.trim() : value;
  }

  static toNumber(value: unknown): number {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Valor inválido para conversão numérica: ${value}`);
    }
    return num;
  }

  static toInt(value: unknown): number {
    const num = parseInt(String(value));
    if (isNaN(num)) {
      throw new Error(`Valor inválido para conversão inteira: ${value}`);
    }
    return num;
  }
}
