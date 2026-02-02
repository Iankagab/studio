"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Servico = {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
};

export function Servicos() {
  const [servicos, setServicos] = useState<Servico[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = "https://studio-745a.onrender.com";

  useEffect(() => {
    async function carregarServicos() {
      try {
        const response = await fetch(`${API_URL}/servicos`);
        const data = await response.json();
        setServicos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        setServicos([]);
      }
    }

    carregarServicos();
  }, []);

  if (servicos === null) {
    return (
      <p className="text-center text-gray-500 animate-pulse mt-10">
        Carregando serviços...
      </p>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-4xl font-bold">Serviços</h1>
          <p className="text-gray-600 mt-2">Gerencie os serviços</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {servicos.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          Nenhum serviço cadastrade.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map(servico => (
            <div
              key={servico.id}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-bold text-lg">{servico.nome}</h3>
                <div className="flex gap-2">
                  <Pencil className="w-4 h-4 cursor-pointer" />
                  <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                ⏱ {servico.duracao} minutos
              </p>
              <p className="text-sm font-semibold">
                💰 R$ {servico.preco.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
