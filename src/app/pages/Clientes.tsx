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

  // URL DA API
  const API_URL = "https://studio-745a.onrender.com";

  async function carregarClientes() {
    try {
      const response = await fetch(`${API_URL}/clientes`);
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
      await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
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
        ? `${API_URL}/clientes/${editingCliente.id}`
        : `${API_URL}/clientes`;
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Clientes</h1>
          <p className="text-gray-600 mt-2">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={handleNovoCliente}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6 relative">
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full md:w-96 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
      </div>

      {isLoading ? (
         <p className="text-center text-gray-500 animate-pulse mt-10">Carregando clientes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-100 p-3 rounded-full"><User className="w-6 h-6 text-purple-600" /></div>
                    <div className="flex gap-1">
                        <button onClick={() => handleEditarCliente(cliente)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleExcluirCliente(cliente.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cliente.nome}</h3>
                <div className="space-y-2">
                    {cliente.telefone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> <span className="text-sm">{cliente.telefone}</span></div>}
                    {cliente.email && <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> <span className="text-sm">{cliente.email}</span></div>}
                </div>
            </div>
          ))}
          {clientesFiltrados.length === 0 && <p className="text-gray-500 col-span-full text-center py-10">Nenhum cliente encontrado.</p>}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
             <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingCliente ? "Editar" : "Novo"} Cliente</h2>
                <button onClick={() => setShowModal(false)}><X className="text-gray-400" /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div><label className="block text-sm font-bold mb-1">Nome *</label><input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
                 <div><label className="block text-sm font-bold mb-1">Telefone</label><input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="(00) 00000-0000" /></div>
                 <div><label className="block text-sm font-bold mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
                 <button type="submit" disabled={isSaving} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50">
                     {isSaving ? "Salvando..." : "Salvar"}
                 </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}