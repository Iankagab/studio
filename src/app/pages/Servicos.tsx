"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash } from "lucide-react";

export function Servicos() {
  const API_URL = "https://studio-745a.onrender.com";

  const [listaServicos, setListaServicos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    duracao: "",
    descricao: "",
  });

  // --- CARREGAMENTO ---
  async function carregarServicos() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/servicos`);
      const data = await res.json();
      if (Array.isArray(data)) setListaServicos(data);
    } catch (error) {
      console.error("Erro ao carregar serviços", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  // --- AÇÕES ---
  const abrirNovo = () => {
    setEditingId(null);
    setFormData({ nome: "", preco: "", duracao: "", descricao: "" });
    setShowModal(true);
  };

  const abrirEdicao = (servico: any) => {
    setEditingId(servico.id);
    setFormData({
      nome: servico.nome,
      preco: String(servico.preco),
      duracao: String(servico.duracao),
      descricao: servico.descricao || "",
    });
    setShowModal(true);
  };

  const salvarServico = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        nome: formData.nome,
        preco: Number(formData.preco),
        duracao: Number(formData.duracao),
        descricao: formData.descricao,
      };

      const url = editingId
        ? `${API_URL}/servicos/${editingId}`
        : `${API_URL}/servicos`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await carregarServicos();
        setShowModal(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const excluirServico = async (id: string) => {
    if (!confirm("Deseja remover este serviço?")) return;
    try {
      await fetch(`${API_URL}/servicos/${id}`, { method: "DELETE" });
      setListaServicos(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 relative min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Serviços
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie os serviços oferecides
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Serviço
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100">
        {isLoading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Carregando serviços...
          </p>
        ) : listaServicos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Nenhum serviço cadastrade
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listaServicos.map(servico => (
              <div
                key={servico.id}
                className="border-2 border-purple-100 rounded-xl p-5 bg-gradient-to-r from-white to-purple-50 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {servico.nome}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEdicao(servico)}
                      className="p-1 rounded hover:bg-purple-100"
                    >
                      <Pencil className="w-4 h-4 text-purple-500" />
                    </button>
                    <button
                      onClick={() => excluirServico(servico.id)}
                      className="p-1 rounded hover:bg-red-100"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {servico.descricao || "Sem descrição"}
                </p>

                <div className="flex justify-between text-sm font-bold text-purple-700">
                  <span>R$ {servico.preco.toFixed(2)}</span>
                  <span>{servico.duracao} min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingId ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={salvarServico} className="space-y-4">
              <input
                required
                placeholder="Nome"
                value={formData.nome}
                onChange={e =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  placeholder="Preço"
                  value={formData.preco}
                  onChange={e =>
                    setFormData({ ...formData, preco: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl"
                />
                <input
                  required
                  type="number"
                  placeholder="Duração (min)"
                  value={formData.duracao}
                  onChange={e =>
                    setFormData({ ...formData, duracao: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Descrição"
                value={formData.descricao}
                onChange={e =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full p-3 border rounded-xl resize-none"
              />

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl disabled:opacity-70"
              >
                {isSaving ? "Salvando..." : "Salvar Serviço"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
