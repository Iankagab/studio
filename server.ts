import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota raiz (evita 404 no Render)
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

/* =========================
   ROTAS DE SERVIÇOS
========================= */

app.get("/servicos", async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany();
    res.json(
      servicos.map(s => ({ ...s, preco: Number(s.preco) }))
    );
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

app.post("/servicos", async (req, res) => {
  try {
    const { nome, preco, duracao, descricao } = req.body;
    const novo = await prisma.servico.create({
      data: {
        nome,
        preco: Number(preco),
        duracao: Number(duracao),
        descricao,
      },
    });
    res.json(novo);
  } catch {
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
});

app.put("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, duracao, descricao } = req.body;

    const atualizado = await prisma.servico.update({
      where: { id },
      data: {
        nome,
        preco: Number(preco),
        duracao: Number(duracao),
        descricao,
      },
    });

    res.json(atualizado);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar serviço" });
  }
});

app.delete("/servicos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.servico.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erro ao excluir serviço" });
  }
});

/* =========================
   ROTAS DE CLIENTES
========================= */

app.get("/clientes", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
    });
    res.json(clientes);
  } catch {
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
  } catch {
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
  } catch {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erro ao excluir cliente" });
  }
});

/* =========================
   ROTAS DE AGENDAMENTOS
========================= */

app.get("/agendamentos", async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { data: "asc" },
      include: { servicos: true, cliente: true },
    });

    const formatado = agendamentos.map(item => ({
      id: item.id,
      clienteNome: item.clienteNome,
      clienteTelefone: item.cliente?.telefone || null,
      data: item.data.toISOString().split("T")[0],
      hora: item.data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      }),
      status: item.status,
      observacoes: item.observacoes || "",
      servicos: item.servicos.map(s => ({
        ...s,
        preco: Number(s.preco),
      })),
    }));

    res.json(formatado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

app.post("/agendamentos", async (req, res) => {
  try {
    const { clienteNome, clienteId, servicosIds, data, hora, observacoes } = req.body;

    const dataHora = new Date(`${data}T${hora}:00`);

    const novo = await prisma.agendamento.create({
      data: {
        clienteNome,
        clienteId,
        data: dataHora,
        observacoes,
        status: "pendente",
        servicos: {
          connect: servicosIds.map((id: string) => ({ id })),
        },
      },
      include: { servicos: true },
    });

    res.json({
      ...novo,
      servicos: novo.servicos.map(s => ({ ...s, preco: Number(s.preco) })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

/* 🔴 ÚNICA rota PUT /agendamentos/:id */
app.put("/agendamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteNome, clienteId, servicosIds, data, hora, observacoes } = req.body;

    const dataHora = new Date(`${data}T${hora}:00`);

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        clienteNome,
        clienteId,
        data: dataHora,
        observacoes,
        servicos: {
          set: servicosIds.map((sid: string) => ({ id: sid })),
        },
      },
      include: { servicos: true },
    });

    res.json({
      ...atualizado,
      servicos: atualizado.servicos.map(s => ({ ...s, preco: Number(s.preco) })),
    });
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
  } catch {
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
  } catch {
    res.status(500).json({ error: "Erro ao confirmar" });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
