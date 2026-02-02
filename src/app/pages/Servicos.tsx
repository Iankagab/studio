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

  // URL da API (Local ou Produção)
  const API_URL = "https://studio-745a.onrender.com";

async function carregarServicos() {
  try {
    const response = await fetch(`${API_URL}/servicos`);
    if (!response.ok) throw new Error("Erro no servidor");
    const data = await response.json();
    if (Array.isArray(data)) setServicos(data);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    alert("O servidor está demorando a responder. Tente atualizar a página.");
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
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const servicoSalvo = await response.json();
        servicoSalvo.preco = Number(servicoSalvo.preco);
        servicoSalvo.duracao = Number(servicoSalvo.duracao);

        if (editingServico) {
          setServicos((prev) => prev.map(s => s.id === servicoSalvo.id ? servicoSalvo : s));
        } else {
          setServicos((prev) => [...prev, servicoSalvo]);
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Serviços</h1>
          <p className="text-gray-600 mt-2">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={handleNovoServico}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg animate-pulse">Carregando serviços...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{servico.nome}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditarServico(servico)} className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleExcluirServico(servico.id)} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {servico.descricao && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{servico.descricao}</p>}

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl transition-colors hover:bg-purple-50">
                      <div className="bg-purple-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div>
                      <div><p className="text-xs text-gray-600">Duração</p><p className="text-sm font-semibold text-gray-900">{servico.duracao} minutos</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl transition-colors hover:bg-blue-50">
                      <div className="bg-blue-100 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                      <div><p className="text-xs text-gray-600">Preço</p><p className="text-sm font-bold text-gray-900">R$ {servico.preco.toFixed(2)}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {servicos.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-purple-100 mt-6">
              <p className="text-gray-500">Nenhum serviço cadastrado. Clique em "Novo Serviço" para começar.</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 transform transition-all scale-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{editingServico ? "Editar Serviço" : "Novo Serviço"}</h2>
                <p className="text-sm text-gray-500">{editingServico ? "Atualize os dados" : "Cadastre um novo serviço"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Serviço *</label><input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: Corte Feminino" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Duração (min) *</label><div className="relative"><input type="number" value={formData.duracao} onChange={(e) => setFormData({ ...formData, duracao: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="60" /><Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" /></div></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Preço (R$) *</label><div className="relative"><input type="number" value={formData.preco} onChange={(e) => setFormData({ ...formData, preco: e.target.value })} required className="w-full px-4 py-3 border border-gray-200 rounded-xl pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="80.00" step="0.01" /><DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" /></div></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label><textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isSaving ? "Salvando..." : (editingServico ? "Salvar" : "Criar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}