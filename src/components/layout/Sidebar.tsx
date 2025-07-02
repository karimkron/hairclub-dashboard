import { Home, Calendar, Package, Menu, ShoppingCart, ClipboardList, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const menuItems = [
    { title: 'Inicio', icon: Home, path: '/dashboard' },
    { title: 'Tienda', icon: ShoppingCart, path: '/dashboard/products' },
    { title: 'Mis Citas', icon: ClipboardList, path: '/dashboard/my-appointments' },
    { title: 'Historial', icon: History, path: '/dashboard/appointment-history' },
    { title: 'Reservar', icon: Calendar, path: '/dashboard/appointments' },
    { title: 'Servicios', icon: Package, path: '/dashboard/services' },

  ];

  return (
    <aside className={`fixed z-50 left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 
      ${isSidebarOpen ? 'w-64' : 'w-20'} hidden lg:block`}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h1 className={`font-bold text-gray-800 transition-all ${isSidebarOpen ? 'text-xl' : 'text-sm'}`}>
          {isSidebarOpen ? 'BARBERSHOP' : 'BS'}
        </h1>
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-6 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mb-2 flex items-center rounded-lg px-4 py-2.5 transition-colors
              ${location.pathname === item.path
                ? 'bg-amber-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <item.icon className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">{item.title}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;