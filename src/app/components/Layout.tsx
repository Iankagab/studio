import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, LayoutDashboard, Scissors, Sparkles } from "lucide-react";

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-lg border-r border-purple-100 flex flex-col shadow-xl">
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Saas - Studio</h1>
              <p className="text-xs text-purple-100">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
            Menu Principal
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive("/") && location.pathname === "/"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "text-gray-700 hover:bg-purple-50 hover:scale-105 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive("/") && location.pathname === "/"
                    ? "bg-white/20"
                    : "bg-purple-100"
                }`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/agendamentos"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive("/agendamentos")
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "text-gray-700 hover:bg-purple-50 hover:scale-105 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive("/agendamentos")
                    ? "bg-white/20"
                    : "bg-purple-100"
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-medium">Agendamentos</span>
              </Link>
            </li>
            <li>
              <Link
                to="/servicos"
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive("/servicos")
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "text-gray-700 hover:bg-purple-50 hover:scale-105 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive("/servicos")
                    ? "bg-white/20"
                    : "bg-purple-100"
                }`}>
                  <Scissors className="w-5 h-5" />
                </div>
                <span className="font-medium">Serviços</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">admin@salon.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}