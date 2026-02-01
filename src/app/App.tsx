import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./Sidebar"; 
import { Dashboard } from "./pages/Dashboard";
import { Agendamentos } from "./pages/Agendamentos";
import { Servicos } from "./pages/Servicos";
import { Clientes } from "./pages/Clientes";

// ADICIONEI "default" AQUI PARA O main.tsx ACEITAR
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-64 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}