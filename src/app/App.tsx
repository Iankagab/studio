import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./Sidebar"; 
import { Dashboard } from "./pages/Dashboard";
import { Agendamentos } from "./pages/Agendamentos";
import { Servicos } from "./pages/Servicos";
import { Clientes } from "./pages/Clientes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 pt-[112px] lg:pt-0 lg:ml-64">
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
