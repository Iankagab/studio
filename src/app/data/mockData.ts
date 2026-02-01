export interface Servico {
  id: string;
  nome: string;
  duracao: number; // em minutos
  preco: number;
  descricao?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  servicoId: string;
  data: string;
  hora: string;
  status: "confirmado" | "pendente" | "cancelado" | "concluido";
  observacoes?: string;
}

// Mock data
export const mockServicos: Servico[] = [
  { id: "1", nome: "Corte Feminino", duracao: 60, preco: 80, descricao: "Corte e escova" },
  { id: "2", nome: "Corte Masculino", duracao: 30, preco: 45, descricao: "Corte tradicional" },
  { id: "3", nome: "Coloração", duracao: 120, preco: 180, descricao: "Tintura completa" },
  { id: "4", nome: "Manicure", duracao: 45, preco: 35 },
  { id: "5", nome: "Pedicure", duracao: 60, preco: 45 },
  { id: "6", nome: "Escova", duracao: 45, preco: 50 },
  { id: "7", nome: "Hidratação", duracao: 60, preco: 70 },
  { id: "8", nome: "Maquiagem", duracao: 90, preco: 120 },
];

export const mockClientes: Cliente[] = [
  { id: "1", nome: "Maria Silva", telefone: "(11) 99999-1234", email: "maria@email.com" },
  { id: "2", nome: "Ana Santos", telefone: "(11) 98888-5678", email: "ana@email.com" },
  { id: "3", nome: "Julia Costa", telefone: "(11) 97777-9012", email: "julia@email.com" },
  { id: "4", nome: "Carla Lima", telefone: "(11) 96666-3456", email: "carla@email.com" },
  { id: "5", nome: "Paula Oliveira", telefone: "(11) 95555-7890", email: "paula@email.com" },
  { id: "6", nome: "Roberto Alves", telefone: "(11) 94444-2345", email: "roberto@email.com" },
  { id: "7", nome: "Carlos Pereira", telefone: "(11) 93333-6789", email: "carlos@email.com" },
];

export const mockAgendamentos: Agendamento[] = [
  {
    id: "1",
    clienteId: "1",
    servicoId: "1",
    data: "2026-01-31",
    hora: "09:00",
    status: "confirmado",
  },
  {
    id: "2",
    clienteId: "2",
    servicoId: "3",
    data: "2026-01-31",
    hora: "10:00",
    status: "confirmado",
  },
  {
    id: "3",
    clienteId: "3",
    servicoId: "4",
    data: "2026-01-31",
    hora: "11:30",
    status: "pendente",
  },
  {
    id: "4",
    clienteId: "4",
    servicoId: "2",
    data: "2026-01-31",
    hora: "14:00",
    status: "cancelado",
  },
  {
    id: "5",
    clienteId: "5",
    servicoId: "6",
    data: "2026-01-31",
    hora: "15:00",
    status: "confirmado",
  },
  {
    id: "6",
    clienteId: "6",
    servicoId: "2",
    data: "2026-01-31",
    hora: "16:00",
    status: "confirmado",
  },
  {
    id: "7",
    clienteId: "7",
    servicoId: "5",
    data: "2026-02-01",
    hora: "10:00",
    status: "confirmado",
  },
];
