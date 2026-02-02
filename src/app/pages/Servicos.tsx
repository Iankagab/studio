"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Clock, DollarSign } from "lucide-react";

type Servico = {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
};

export function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    duracao: "",
    preco: "",
    descricao: "",
  });

  const API_URL = "https://studio-745a.onrender.com";

  async function carregarServicos() {
    try {
      const response = await fetch(`${API_URL}/servicos`);

      if (response.ok) {
        const data = await response.json();
        setServicos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      setServicos([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  const handleNovoServico = () => {
    setEditingServico(null);
    setFormData({ nome: "", duracao: "", preco: "", descricao: "" });
    setShowModal(true);
  };

  const handleEditarServico = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      duracao: String(servico.duracao),
      preco: String(servico.preco),
      descricao: servico.descricao || "",
    });
    setShowModal(true);
  };

  const handleExcluirServico = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      await fetch(`${API_URL}/servicos/${id}`, { method: "DELETE" });
      setServicos(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco || !formData.duracao) return;

    setIsSaving(true);

    try {
      const url = editingServico
        ? `${API_URL}/servicos/${editingServico.id}`
        : `${API_URL}/servicos`;

      const method = editingServico ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          preco: Number(formData.preco),
          duracao: Number(formData.duracao),
          descricao: formData.descricao,
        }),
      });

      if (response.ok) {
        const salvo = await response.json();

        if (editingServico) {
          setServicos(prev =>
            prev.map(s => (s.id === salvo.id ? salvo : s))
          );
        } else {
          setServicos(prev => [...prev, salvo]);
        }

        setShowModal(false);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Serviços</h1>
          <p className="text-gray-600 mt-2">Gerencie os serviços</p>
        </div>

        <button
          onClick={handleNovoServico}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 animate-pulse mt-10">
          Carregando serviços...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map(servico => (
            <div key={servico.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">{servico.nome}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditarServico(servico)}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleExcluirServico(servico.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
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

          {servicos.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">
              Nenhum serviço encontrade.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
