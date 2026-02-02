"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

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

  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    duracao: "",
    descricao: "",
  });

  const API_URL = "https://studio-745a.onrender.com";

  // ======================
  // CARREGAR SERVIÇOS
  // ======================
  useEffect(() => {
    async function carregarServicos() {
      try {
        const res = await fetch(`${API_URL}/servicos`);
        const data = await res.json();
        setServicos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setServicos([]);
      }
    }

    carregarServicos();
  }, []);

  // ======================
  // AÇÕES
  // ======================
  function handleNovoServico() {
    setEditingServico(null);
    setFormData({ nome: "", preco: "", duracao: "", descricao: "" });
    setShowModal(true);
  }

  function handleEditarServico(servico: Servico) {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      preco: String(servico.preco),
      duracao: String(servico.duracao),
      descricao: servico.descricao || "",
    });
    setShowModal(true);
  }

  async function handleExcluirServico(id: string) {
    if (!confirm("Deseja excluir este serviço?")) return;

    try {
      await fetch(`${API_URL}/servicos/${id}`, { method: "DELETE" });
      setServicos(prev => prev!.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      nome: formData.nome,
      preco: Number(formData.preco),
      duracao: Number(formData.duracao),
      descricao: formData.descricao,
    };

    try {
      const url = editingServico
        ? `${API_URL}/servicos/${editingServico.id}`
        : `${API_URL}/servicos`;

      const method = editingServico ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const salvo = await res.json();

      if (editingServico) {
        setServicos(prev =>
          prev!.map(s => (s.id === salvo.id ? salvo : s))
        );
      } else {
        setServicos(prev => [...prev!, salvo]);
      }

      setShowModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  // ======================
  // LOADING
  // ======================
  if (servicos === null) {
    return (
      <p className="text-center text-gray-500 animate-pulse mt-10">
        Carregando serviços...
      </p>
    );
  }

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between mb-8">
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

      {servicos.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhum serviço cadastrade.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicos.map(servico => (
            <div key={servico.id} className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between mb-2">
                <h3 className="font-bold">{servico.nome}</h3>
                <div className="flex gap-2">
                  <Pencil
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => handleEditarServico(servico)}
                  />
                  <Trash2
                    className="w-4 h-4 text-red-500 cursor-pointer"
                    onClick={() => handleExcluirServico(servico.id)}
                  />
                </div>
              </div>

              <p>⏱ {servico.duracao} min</p>
              <p>💰 R$ {servico.preco.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <div className="flex justify-between">
              <h2 className="font-bold">
                {editingServico ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            <input
              placeholder="Nome"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              placeholder="Preço"
              type="number"
              value={formData.preco}
              onChange={e => setFormData({ ...formData, preco: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <input
              placeholder="Duração (min)"
              type="number"
              value={formData.duracao}
              onChange={e => setFormData({ ...formData, duracao: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />

            <textarea
              placeholder="Descrição"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <button
              disabled={isSaving}
              className="w-full bg-purple-600 text-white py-2 rounded"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
