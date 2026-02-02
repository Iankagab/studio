import { Calendar, Scissors, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
    { icon: User, label: "Clientes", path: "/clientes" },
    { icon: Scissors, label: "Serviços", path: "/servicos" },
  ];

  return (
    <>
      {/* ===== MENU MOBILE (FIXO NO TOPO) ===== */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Scissors className="w-5 h-5 text-purple-600" />
            BeautySaaS
          </h1>
        </div>

        <nav className="flex justify-around px-2 pb-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? "text-purple-700 bg-purple-50 font-semibold"
                    : "text-gray-500 hover:text-purple-600"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside className="hidden lg:block w-64 bg-white/80 backdrop-blur-md border-r border-purple-100 min-h-screen fixed left-0 top-0 z-40 shadow-xl">
        <div className="p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Scissors className="w-6 h-6 text-purple-600" />
            BeautySaaS
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold shadow-sm border border-purple-100"
                    : "text-gray-600 hover:bg-white hover:shadow-md hover:text-purple-600"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg shadow-purple-500/30">
            <p className="text-xs font-medium opacity-80 mb-1">
              Status do Sistema
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold">Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
