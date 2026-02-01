import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, User, Phone, Mail, Search } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
};

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busca, setBusca] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
  });

  async function carregarClientes() {
    try {
      const response = await fetch("http://localhost:3001/clientes");
      if (response.ok) {
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleNovoCliente = () => {
    setEditingCliente(null);
    setFormData({ nome: "", telefone: "", email: "" });
    setShowModal(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone || "",
      email: cliente.email || "",
    });
    setShowModal(true);
  };

  const handleExcluirCliente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await fetch(`http://localhost:3001/clientes/${id}`, { method: "DELETE" });
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;
    setIsSaving(true);

    try {
      const url = editingCliente
        ? `http://localhost:3001/clientes/${editingCliente.id}`
        : "http://localhost:3001/clientes";
      const method = editingCliente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const salvo = await response.json();
        if (editingCliente) {
          setClientes((prev) => prev.map((c) => (c.id === salvo.id ? salvo : c)));
        } else {
          setClientes((prev) => [...prev, salvo]);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtro de busca
  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (c.telefone && c.telefone.includes(busca))
  );

  return (
    <div className="p-8 relative min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Clientes</h1>
          <p className="text-gray-600 mt-2">Gerencie sua base de clientes</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            <button
            onClick={handleNovoCliente}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Novo Cliente</span>
            </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 animate-pulse mt-10">Carregando clientes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all border border-purple-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                        {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{cliente.nome}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditarCliente(cliente)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleExcluirCliente(cliente.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-3">
                {cliente.telefone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">{cliente.telefone}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span className="text-sm truncate">{cliente.email}</span>
                  </div>
                )}
                {!cliente.telefone && !cliente.email && (
                    <p className="text-xs text-gray-400 italic">Sem contato cadastrado</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {clientesFiltrados.length === 0 && !isLoading && (
          <div className="text-center py-10 text-gray-500">Nenhum cliente encontrado.</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingCliente ? "Editar Cliente" : "Novo Cliente"}</h2>
              <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="block text-sm font-semibold mb-1">Nome *</label><input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="w-full p-3 border rounded-xl" placeholder="Nome do cliente" /></div>
              <div><label className="block text-sm font-semibold mb-1">Telefone</label><input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="(00) 00000-0000" /></div>
              <div><label className="block text-sm font-semibold mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="cliente@email.com" /></div>
              <button type="submit" disabled={isSaving} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-70">
                {isSaving ? "Salvando..." : (editingCliente ? "Salvar Alterações" : "Cadastrar Cliente")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}