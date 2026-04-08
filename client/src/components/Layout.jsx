import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/cajas', label: 'Cajas', icon: '⚙' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
];

function NavIcon({ to, label, icon, exact }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs transition-colors ${
          isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
        }`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNav = isAdmin ? [...navItems, { to: '/usuarios', label: 'Usuarios', icon: '🔑' }] : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-800 border-r border-slate-700 shrink-0">
        <div className="px-4 py-5 border-b border-slate-700">
          <h1 className="text-sm font-bold text-sky-400 leading-tight">Cajas Automáticas</h1>
          <p className="text-xs text-slate-400 mt-0.5">{user?.nombre}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {allNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-sky-900/50 text-sky-400' : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors">
            <span>↪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
          <h1 className="text-sm font-bold text-sky-400">Cajas Automáticas</h1>
          <span className="text-xs text-slate-400">{user?.nombre}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex items-center justify-around px-2 py-1 z-40">
          {allNav.map((item) => (
            <NavIcon key={item.to} {...item} />
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs text-slate-400">
            <span className="text-lg leading-none">↪</span>
            <span>Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
