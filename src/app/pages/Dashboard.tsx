import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, DollarSign, XCircle, RefreshCw, MessageCircle, ExternalLink } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Dashboard() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "confirmado" | "cancelado" | "pendente">("todos");

  const hoje = new Date(); 
  
  // URL DA API (Variável de Ambiente)
  const API_URL = "https://studio-745a.onrender.com";

  async function carregarDados() {
    try {
      setIsLoading(true);
      // CORREÇÃO AQUI: Usando a variável de ambiente
      const response = await fetch(`${API_URL}/agendamentos`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAgendamentos(data);
      } else {
        setAgendamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const agendamentosHoje = agendamentos.filter((a) => {
    if (!a.data) return false;
    const dataAgendamento = new Date(a.data + "T00:00:00");
    return isSameDay(dataAgendamento, hoje);
  });

  const confirmados = agendamentosHoje.filter((a) => a.status === "confirmado");
  const cancelados = agendamentosHoje.filter((a) => a.status === "cancelado"); 
  const pendentes = agendamentosHoje.filter((a) => a.status === "pendente");

  const listaExibicao = filtroAtivo === "todos" 
    ? agendamentosHoje 
    : agendamentosHoje.filter((a) => a.status === filtroAtivo);

  const receitaHoje = confirmados.reduce((totalGeral, agendamento) => {
    const servicos = agendamento.servicos || [];
    const totalDoAgendamento = servicos.reduce((acc: number, s: any) => acc + Number(s.preco), 0);
    return totalGeral + totalDoAgendamento;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-700 border border-green-200";
      case "pendente": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "cancelado": return "bg-red-100 text-red-700 border border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Função geradora de link
  const gerarLinkWhatsapp = (telefone: string, nome: string, hora: string) => {
      if (!telefone) return "#";
      const numeros = telefone.replace(/\D/g, "");
      const foneFinal = numeros.length <= 11 ? `55${numeros}` : numeros;
      const mensagem = `Olá ${nome}, tudo bem? Passando para confirmar seu agendamento hoje às ${hora}.`;
      return `https://wa.me/${foneFinal}?text=${encodeURIComponent(mensagem)}`;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2 capitalize">
            Visão geral do dia {format(hoje, "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <button 
          onClick={carregarDados}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
        >
          <RefreshCw className={`w-6 h-6 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button onClick={() => setFiltroAtivo("todos")} className={`bg-white p-6 rounded-2xl shadow-lg border transition-all hover:scale-105 text-left ${filtroAtivo === 'todos' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-100'}`}>
             <div className="flex justify-between"><p className="text-sm text-gray-600 font-medium">Total do Dia</p><Calendar className="text-purple-600" /></div>
             <p className="text-3xl font-bold text-gray-900 mt-2">{agendamentosHoje.length}</p>
        </button>
        <button onClick={() => setFiltroAtivo("confirmado")} className={`bg-white p-6 rounded-2xl shadow-lg border transition-all hover:scale-105 text-left ${filtroAtivo === 'confirmado' ? 'border-green-500 ring-2 ring-green-200' : 'border-green-100'}`}>
             <div className="flex justify-between"><p className="text-sm text-gray-600 font-medium">Confirmados</p><CheckCircle2 className="text-green-600" /></div>
             <p className="text-3xl font-bold text-green-600 mt-2">{confirmados.length}</p>
        </button>
        <button onClick={() => setFiltroAtivo("cancelado")} className={`bg-white p-6 rounded-2xl shadow-lg border transition-all hover:scale-105 text-left ${filtroAtivo === 'cancelado' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-100'}`}>
             <div className="flex justify-between"><p className="text-sm text-gray-600 font-medium">Cancelados</p><XCircle className="text-red-600" /></div>
             <p className="text-3xl font-bold text-red-600 mt-2">{cancelados.length}</p>
        </button>
        <button onClick={() => setFiltroAtivo("pendente")} className={`bg-white p-6 rounded-2xl shadow-lg border transition-all hover:scale-105 text-left ${filtroAtivo === 'pendente' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-blue-100'}`}>
             <div className="flex justify-between"><p className="text-sm text-gray-600 font-medium">Receita Real</p><DollarSign className="text-blue-600" /></div>
             <p className="text-3xl font-bold text-gray-900 mt-2">R$ {receitaHoje.toFixed(2)}</p>
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-2xl font-bold text-white">Agenda de Hoje</h2>
          <p className="text-purple-100 text-sm mt-1">
            {listaExibicao.length} {filtroAtivo === "todos" ? "agendamentos" : `agendamento(s) ${filtroAtivo}(s)`}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
            {isLoading ? (
               <p className="text-center text-gray-500 py-12">Carregando dados...</p>
            ) : listaExibicao.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum agendamento encontrado para hoje.</p>
              </div>
            ) : (
              listaExibicao.map((agendamento) => {
                const servicos = agendamento.servicos || [];
                const total = servicos.reduce((acc: number, s: any) => acc + Number(s.preco), 0);
                const duracaoTotal = servicos.reduce((acc: number, s: any) => acc + s.duracao, 0);
                const nomesServicos = servicos.map((s: any) => s.nome).join(", ");
                const temTelefone = !!agendamento.clienteTelefone;

                return (
                  <div key={agendamento.id} className={`bg-gradient-to-r from-white to-purple-50 rounded-xl p-5 border-2 transition-all duration-200 hover:shadow-lg ${agendamento.status === 'cancelado' ? 'border-red-100 opacity-75' : 'border-purple-100 hover:border-purple-300'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${agendamento.status === 'cancelado' ? 'bg-red-50' : 'bg-purple-100'}`}>
                          <Clock className={`w-5 h-5 ${agendamento.status === 'cancelado' ? 'text-red-400' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${agendamento.status === 'cancelado' ? 'text-red-600 line-through' : 'text-purple-600'}`}>{agendamento.hora}</p>
                          <p className="text-xs text-gray-500">Horário</p>
                        </div>
                      </div>

                      {/* Botão de WhatsApp GRANDE no topo */}
                      {temTelefone && agendamento.status !== 'cancelado' && (
                          <a 
                             href={gerarLinkWhatsapp(agendamento.clienteTelefone, agendamento.clienteNome, agendamento.hora)}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                             <MessageCircle className="w-4 h-4" />
                             <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                      )}

                      <span className={`px-4 py-2 text-xs font-bold rounded-full ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-purple-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Cliente</p>
                        <p className="text-sm font-bold text-gray-900">{agendamento.clienteNome}</p>
                        
                        {/* AQUI ESTÁ A MUDANÇA: O TEXTO VIROU LINK */}
                        {temTelefone && (
                            <a 
                                href={gerarLinkWhatsapp(agendamento.clienteTelefone, agendamento.clienteNome, agendamento.hora)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800 font-bold mt-1 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                                <MessageCircle className="w-3 h-3" />
                                {agendamento.clienteTelefone} <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Serviços</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1" title={nomesServicos}>{nomesServicos || "Nenhum serviço"}</p>
                        <p className="text-xs text-gray-500">{duracaoTotal} minutos</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Total</p>
                        <p className="text-lg font-bold text-gray-900">R$ {total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      </div>
    </div>
  );
}