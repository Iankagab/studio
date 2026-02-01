import express from "express";
import cors from "cors"; // Certifique-se de ter instalado: npm i cors
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// Use a porta do sistema OU a 3001
const PORT = process.env.PORT || 3001;

// Libera acesso para qualquer site (por enquanto, para facilitar)
app.use(cors());
app.use(express.json());

// ... SUAS ROTAS AQUI ...

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

// --- ROTAS DE SERVIÇOS ---

app.get("/servicos", async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany();
    const formatado = servicos.map((s) => ({
      ...s,
      preco: Number(s.preco),
    }));
    res.json(formatado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

app.post("/servicos", async (req, res) => {
  try {
    const { nome, preco, duracao, descricao } = req.body;
    const novo = await prisma.servico.create({
      data: { nome, preco: Number(preco), duracao: Number(duracao), descricao },
    });
    res.json(novo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
});

app.put("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, duracao, descricao } = req.body;
    const atualizado = await prisma.servico.update({
      where: { id },
      data: { nome, preco: Number(preco), duracao: Number(duracao), descricao },
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar serviço" });
  }
});

app.delete("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.servico.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir" });
  }
});

// --- ROTAS DE CLIENTES ---

app.get("/clientes", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" }, // Ordem alfabética
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    const novo = await prisma.cliente.create({
      data: { nome, telefone, email },
    });
    res.json(novo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;
    const atualizado = await prisma.cliente.update({
      where: { id },
      data: { nome, telefone, email },
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Opcional: Verificar se tem agendamentos antes de excluir
    await prisma.cliente.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir cliente" });
  }
});

// --- ROTAS DE AGENDAMENTOS (MULTIPLE SERVICES) ---

app.get("/agendamentos", async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { data: "asc" },
      include: { 
        servicos: true,
        cliente: true // <--- NOVA LINHA: Traz os dados do dono do agendamento
      }, 
    });

    const formatado = agendamentos.map((item) => {
      const dataLocal = new Date(item.data);
      const ano = dataLocal.getFullYear();
      const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
      const dia = String(dataLocal.getDate()).padStart(2, '0');
      const dataString = `${ano}-${mes}-${dia}`;

      return {
        id: item.id,
        clienteNome: item.clienteNome,
        // Repassa o telefone se existir cliente vinculado
        clienteTelefone: item.cliente?.telefone || null, 
        
        data: dataString,
        hora: item.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: item.status,
        observacoes: item.observacoes || "",
        servicos: item.servicos.map((s) => ({
          ...s,
          preco: Number(s.preco)
        }))
      };
    });

    res.json(formatado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

app.post("/agendamentos", async (req, res) => {
  try {
    // Agora recebemos clienteId também
    const { clienteNome, clienteId, servicosIds, data, hora, observacoes } = req.body;
    
    const dataHoraCombinada = new Date(`${data}T${hora}:00`);

    const novo = await prisma.agendamento.create({
      data: {
        clienteNome,
        clienteId, // <--- Conecta com o cadastro de clientes
        data: dataHoraCombinada,
        observacoes,
        status: "pendente",
        servicos: {
          connect: servicosIds.map((id: string) => ({ id }))
        }
      },
      include: { servicos: true }
    });
    
    const resposta = {
      ...novo,
      servicos: novo.servicos.map(s => ({...s, preco: Number(s.preco)}))
    };

    res.json(resposta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

app.put("/agendamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteNome, clienteId, servicosIds, data, hora, observacoes } = req.body; // <--- Recebe clienteId
    
    const dataHoraCombinada = new Date(`${data}T${hora}:00`);

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        clienteNome,
        clienteId, // <--- Atualiza o vínculo
        data: dataHoraCombinada,
        observacoes,
        servicos: {
          set: servicosIds.map((id: string) => ({ id }))
        }
      },
      include: { servicos: true }
    });

    const resposta = {
      ...atualizado,
      servicos: atualizado.servicos.map(s => ({...s, preco: Number(s.preco)}))
    };

    res.json(resposta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao editar agendamento" });
  }
});

app.put("/agendamentos/:id/cancelar", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamento.update({
      where: { id },
      data: { status: "cancelado" },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar" });
  }
});

app.put("/agendamentos/:id/confirmar", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamento.update({
      where: { id },
      data: { status: "confirmado" },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao confirmar agendamento" });
  }
});

// Adicione antes do app.listen, junto com os outros PUTs de agendamento

app.put("/agendamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteNome, servicosIds, data, hora, observacoes } = req.body;
    
    const dataHoraCombinada = new Date(`${data}T${hora}:00`);

    // O Prisma precisa desconectar os serviços antigos e conectar os novos
    // A estratégia mais simples é: "set" (substitui tudo pelos novos IDs)
    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        clienteNome,
        data: dataHoraCombinada,
        observacoes,
        servicos: {
          set: servicosIds.map((id: string) => ({ id })) // Substitui a lista inteira
        }
      },
      include: { servicos: true }
    });

    const resposta = {
      ...atualizado,
      servicos: atualizado.servicos.map(s => ({...s, preco: Number(s.preco)}))
    };

    res.json(resposta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao editar agendamento" });
  }
});

// O LISTEN TEM QUE SER A ÚLTIMA COISA DO ARQUIVO
app.listen(3001, () => {
  console.log("🚀 Servidor rodando em http://localhost:3001");
});