import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X, Check, Pencil } from "lucide-react";

export function Agendamentos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  
  // Dados do Sistema
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [listaServicos, setListaServicos] = useState<any[]>([]);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clienteId: "",
    clienteNome: "",
    servicosSelecionados: [] as string[], 
    hora: "",
    observacoes: "",
  });

  // URL DA API
  const API_URL = "https://studio-745a.onrender.com";

  // --- CARREGAMENTO OTIMIZADO ---
  async function carregarDados() {
    setIsLoading(true);
    try {
      const [resAgendamentos, resServicos, resClientes] = await Promise.all([
        fetch(`${API_URL}/agendamentos`),
        fetch(`${API_URL}/servicos`),
        fetch(`${API_URL}/clientes`)
      ]);

      const dadosAgendamentos = await resAgendamentos.json();
      const dadosServicos = await resServicos.json();
      const dadosClientes = await resClientes.json();
      
      if (Array.isArray(dadosAgendamentos)) setAgendamentos(dadosAgendamentos);
      if (Array.isArray(dadosServicos)) setListaServicos(dadosServicos);
      if (Array.isArray(dadosClientes)) setListaClientes(dadosClientes);

    } catch (error) {
      console.error("Erro ao conectar:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // --- HELPERS ---
  const getAgendamentoDate = (dateString: string) => {
      if(!dateString) return new Date();
      const cleanDate = dateString.split("T")[0];
      return new Date(cleanDate + "T00:00:00");
  };

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startOfWeek(monthStart, { locale: ptBR }), end: endOfWeek(endOfMonth(currentMonth), { locale: ptBR }) });

  const agendamentosDoDia = selectedDate
    ? agendamentos.filter((a) => isSameDay(getAgendamentoDate(a.data), selectedDate))
    : [];

  // --- AÇÕES DO FORMULÁRIO ---

  const handleNovoAgendamento = () => {
    setEditingId(null);
    setFormData({ clienteId: "", clienteNome: "", servicosSelecionados: [], hora: "", observacoes: "" });
    setShowModal(true);
  };

  const handleEditarAgendamento = (agendamento: any) => {
    setEditingId(agendamento.id);
    setFormData({
        clienteId: agendamento.clienteId || "",
        clienteNome: agendamento.clienteNome,
        servicosSelecionados: agendamento.servicos.map((s: any) => s.id),
        hora: agendamento.hora,
        observacoes: agendamento.observacoes || "",
    });
    setShowModal(true);
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idSelecionado = e.target.value;
      const clienteEncontrado = listaClientes.find(c => c.id === idSelecionado);
      
      if (clienteEncontrado) {
          setFormData(prev => ({
              ...prev,
              clienteId: idSelecionado,
              clienteNome: clienteEncontrado.nome
          }));
      } else {
          setFormData(prev => ({ ...prev, clienteId: "", clienteNome: "" }));
      }
  };

  const toggleServico = (id: string) => {
    setFormData(prev => {
        const jaSelecionado = prev.servicosSelecionados.includes(id);
        if (jaSelecionado) {
            return { ...prev, servicosSelecionados: prev.servicosSelecionados.filter(item => item !== id) };
        } else {
            return { ...prev, servicosSelecionados: [...prev.servicosSelecionados, id] };
        }
    });
  };

  const totaisSelecionados = listaServicos
    .filter(s => formData.servicosSelecionados.includes(s.id))
    .reduce((acc, curr) => ({ preco: acc.preco + curr.preco, duracao: acc.duracao + curr.duracao }), { preco: 0, duracao: 0 });

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.clienteNome || formData.servicosSelecionados.length === 0 || !formData.hora) return;

    setIsSaving(true);
    try {
      const payload = {
        clienteId: formData.clienteId,
        clienteNome: formData.clienteNome,
        servicosIds: formData.servicosSelecionados,
        data: format(selectedDate, "yyyy-MM-dd"),
        hora: formData.hora,
        observacoes: formData.observacoes,
      };

      const url = editingId 
        ? `${API_URL}/agendamentos/${editingId}`
        : `${API_URL}/agendamentos`;
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const agendamentoSalvo = await response.json();
        agendamentoSalvo.data = payload.data;
        agendamentoSalvo.hora = formData.hora;

        if (editingId) {
            setAgendamentos((lista) => lista.map(a => a.id === editingId ? agendamentoSalvo : a));
        } else {
            setAgendamentos((lista) => [...lista, agendamentoSalvo]);
        }
        setShowModal(false);
        setEditingId(null);
      } else { alert("Erro ao salvar."); }
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  // --- STATUS ---
  const atualizarStatus = async (id: string, novoStatus: string, urlSuffix: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? {...a, status: novoStatus} : a));
    try { await fetch(`${API_URL}/agendamentos/${id}/${urlSuffix}`, { method: "PUT" }); } 
    catch (error) { console.error(error); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-700 border-green-200";
      case "pendente": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelado": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-8 relative min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Agendamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie os agendamentos do salão</p>
        </div>
        <button onClick={handleNovoAgendamento} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-purple-100 rounded-xl"><ChevronLeft className="w-6 h-6 text-purple-600" /></button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-purple-100 rounded-xl"><ChevronRight className="w-6 h-6 text-purple-600" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>)}
                {days.map((day, idx) => {
                    const temAgendamento = agendamentos.some(a => isSameDay(getAgendamentoDate(a.data), day));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    return (
                        <button key={idx} onClick={() => setSelectedDate(day)} className={`min-h-[80px] p-2 rounded-xl border-2 transition-all ${isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200"} ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}`}>
                            <div className={`text-sm mb-1 font-semibold ${isSelected ? "text-purple-700" : "text-gray-700"}`}>{format(day, "d")}</div>
                            {temAgendamento && <div className="w-2 h-2 rounded-full bg-purple-500 mx-auto mt-2" />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Lista Lateral */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100 overflow-y-auto max-h-[800px]">
          <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">{selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}</h2>
          <div className="space-y-3">
              {isLoading ? <p className="text-center text-gray-500 animate-pulse">Carregando...</p> : agendamentosDoDia.length === 0 ? <p className="text-center text-gray-500 py-8">Nenhum agendamento</p> : 
              agendamentosDoDia.map((agendamento) => {
                  const servicos = agendamento.servicos || [];
                  const total = servicos.reduce((acc: number, s: any) => acc + Number(s.preco), 0);
                  const nomesServicos = servicos.map((s: any) => s.nome).join(", ");
                  
                  return (
                    <div 
                        key={agendamento.id} 
                        onClick={() => handleEditarAgendamento(agendamento)}
                        className="border-2 border-purple-100 rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-r from-white to-purple-50 cursor-pointer hover:border-purple-300 group"
                    >
                      <div className="flex justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-purple-600 text-lg">{agendamento.hora}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusStyle(agendamento.status)}`}>{agendamento.status}</span>
                         </div>
                         <div className="flex gap-1">
                            {agendamento.status === 'pendente' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); atualizarStatus(agendamento.id, "confirmado", "confirmar"); }} 
                                    className="text-green-600 p-1 hover:bg-green-50 rounded border border-green-100 bg-white"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            {agendamento.status !== 'cancelado' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); atualizarStatus(agendamento.id, "cancelado", "cancelar"); }} 
                                    className="text-red-600 p-1 hover:bg-red-50 rounded border border-red-100 bg-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                         </div>
                      </div>
                      <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">{agendamento.clienteNome}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{nomesServicos}</p>
                            <p className="text-xs text-gray-500 mt-1 font-bold">Total: R$ {total.toFixed(2)}</p>
                          </div>
                          <Pencil className="w-4 h-4 text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
              })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-white/20">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? "Editar Agendamento" : "Novo Agendamento"}
                </h2>
                <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-sm font-semibold mb-1">Data</label><div className="p-3 border rounded-xl bg-gray-50 text-gray-600 font-medium">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</div></div>
                   <div><label className="block text-sm font-semibold mb-1">Horário *</label><input type="time" required value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
               </div>

               <div>
                 <label className="block text-sm font-semibold mb-1">Cliente *</label>
                 <select required value={formData.clienteId} onChange={handleClienteChange} className="w-full p-3 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Selecione um cliente...</option>
                    {listaClientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} {cliente.telefone ? `(${cliente.telefone})` : ""}
                        </option>
                    ))}
                 </select>
                 {listaClientes.length === 0 && (
                     <p className="text-xs text-red-500 mt-1">Nenhum cliente cadastrado. Cadastre um na aba "Clientes".</p>
                 )}
               </div>

               <div>
                   <label className="block text-sm font-semibold mb-2">Selecione os Serviços *</label>
                   <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-2 bg-gray-50">
                       {listaServicos.map(servico => {
                           const isSelected = formData.servicosSelecionados.includes(servico.id);
                           return (
                               <div key={servico.id} onClick={() => toggleServico(servico.id)} className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center transition-all ${isSelected ? "bg-purple-100 border-purple-500" : "bg-white border-gray-200 hover:border-purple-300"}`}>
                                   <div><p className={`font-bold text-sm ${isSelected ? "text-purple-700" : "text-gray-700"}`}>{servico.nome}</p><p className="text-xs text-gray-500">R$ {servico.preco.toFixed(2)} • {servico.duracao} min</p></div>
                                   {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                               </div>
                           )
                       })}
                   </div>
                   {formData.servicosSelecionados.length > 0 && <div className="mt-2 text-right text-sm text-purple-700 font-bold">Total: R$ {totaisSelecionados.preco.toFixed(2)} • {totaisSelecionados.duracao} min</div>}
               </div>

               <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} rows={2} className="w-full p-3 border rounded-xl resize-none" placeholder="Observações..." />

               <button type="submit" disabled={isSaving} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-70">
                   {isSaving ? "Salvando..." : (editingId ? "Salvar Alterações" : "Confirmar Agendamento")}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}