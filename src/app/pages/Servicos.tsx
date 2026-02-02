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
  // ⬇️ estado começa como null (indeterminado)
  const [servicos, setServicos] = useState<Servico[] | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
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
      const response = await fetch(`${API_URL}/servicos`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Erro no servidor");

      const data = await response.json();
      setServicos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      setServicos([]);
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
        setServicos(prev => prev ? prev.filter(s => s.id !== id) : prev);
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

      if (response.ok) {
        const servicoSalvo = await response.json();

        if (editingServico) {
          setServicos(prev =>
            prev ? prev.map(s => s.id === servicoSalvo.id ? servicoSalvo : s) : prev
          );
        } else {
          setServicos(prev => prev ? [...prev, servicoSalvo] : [servicoSalvo]);
        }

        setShowModal(false);
      } else {
        alert("Erro ao salvar serviço.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 relative min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Serviços
          </h1>
          <p className="text-gray-600 mt-2">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={handleNovoServico}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {/* ⬇️ CONTROLE CORRETO DE RENDER */}
      {servicos === null ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg animate-pulse">
            Carregando serviços...
          </p>
        </div>
      ) : servicos.length === 0 ? (
        <div className="bg-white/80 rounded-2xl shadow-lg p-12 text-center border mt-6">
          <p className="text-gray-500">
            Nenhum serviço cadastrado. Clique em "Novo Serviço" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map(servico => (
            <div
              key={servico.id}
              className="bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border"
            >
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">{servico.nome}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditarServico(servico)}>
                      <Pencil className="w-4 h-4 text-purple-600" />
                    </button>
                    <button onClick={() => handleExcluirServico(servico.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {servico.descricao && (
                  <p className="text-sm text-gray-600 mb-4">
                    {servico.descricao}
                  </p>
                )}

                <p className="text-sm font-semibold">
                  ⏱ {servico.duracao} min • 💰 R$ {servico.preco.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal permanece igual */}
    </div>
  );
}
