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
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/servicos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar serviços");
      }

      const data: Servico[] = await response.json();
      setServicos(data ?? []);
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
      const response = await fetch(`${API_URL}/servicos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServicos(prev => prev.filter(s => s.id !== id));
      } else {
        alert("Não é possível excluir um serviço que já possui agendamentos.");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.duracao || !formData.preco) return;

    setIsSaving(true);

    const payload = {
      nome: formData.nome,
      duracao: Number(formData.duracao),
      preco: Number(formData.preco),
      descricao: formData.descricao,
    };

    try {
      let url = `${API_URL}/servicos`;
      let method = "POST";

      if (editingServico) {
        url = `${API_URL}/servicos/${editingServico.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar serviço");
      }

      const servicoSalvo: Servico = await response.json();

      if (editingServico) {
        setServicos(prev =>
          prev.map(s => (s.id === servicoSalvo.id ? servicoSalvo : s))
        );
      } else {
        setServicos(prev => [...prev, servicoSalvo]);
      }

      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar serviço.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Serviços</h1>
          <p className="text-gray-600 mt-2">Gerencie os serviços oferecidos</p>
        </div>

        <button
          onClick={handleNovoServico}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {isLoading === true ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">
            Carregando serviços...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map(servico => (
              <div
                key={servico.id}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex justify-between mb-4">
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

                <p className="text-sm text-gray-600 mb-2">
                  {servico.descricao}
                </p>

                <p className="text-sm">
                  ⏱ {servico.duracao} minutos
                </p>
                <p className="text-sm font-semibold">
                  💰 R$ {servico.preco.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {servicos.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              Nenhum serviço cadastrade
            </p>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Nome"
                value={formData.nome}
                onChange={e =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Duração"
                type="number"
                value={formData.duracao}
                onChange={e =>
                  setFormData({ ...formData, duracao: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Preço"
                type="number"
                value={formData.preco}
                onChange={e =>
                  setFormData({ ...formData, preco: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <textarea
                placeholder="Descrição"
                value={formData.descricao}
                onChange={e =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded p-2"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-purple-600 text-white rounded p-2"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
