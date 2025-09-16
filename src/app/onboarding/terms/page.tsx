"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components";

export default function Terms() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setUserName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const tempUserData = localStorage.getItem("tempUserData");
    if (!tempUserData) {
      window.location.href = "/";
      return;
    }

    try {
      const userData = JSON.parse(tempUserData);
      setUserName(userData.nome);
    } catch {
      window.location.href = "/";
    }
  }, []);

  const handleContinue = async () => {
    setIsLoading(true);
    setError("");

    try {
      const tempUserData = localStorage.getItem("tempUserData");
      if (!tempUserData) {
        window.location.href = "/";
        return;
      }

      const userData = JSON.parse(tempUserData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("tempUserData");

        localStorage.setItem("user", JSON.stringify(data.usuario));
        localStorage.setItem("token", data.token);

        window.location.href = "/onboarding/categories";
      } else {
        setError(data.error || "Erro ao criar conta");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    localStorage.removeItem("tempUserData");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" className="mx-auto" />
      </div>

      <div className="w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo(a) ao ReUse
        </h1>
        <p className="text-gray-600">Concorde com nossas dicas</p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Cadastre produtos em bom estado, isso pode te ajudar a encontrar as
            melhores trocas.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Especifique marca, modelo e material do produto.
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Informe tamanho/dimensões caso relevante (roupas, móveis,
            eletrônicos etc.).
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Informe sua cidade/bairro (caso o app tenha essa funcionalidade)
            para facilitar a logística da troca.
          </p>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="w-full max-w-md space-y-3">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Criando conta..." : "Eu concordo"}
        </button>

        <button
          onClick={handleReject}
          disabled={isLoading}
          className="w-full text-gray-600 py-3 px-4 font-medium hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Não concordo
        </button>
      </div>
    </div>
  );
}
