import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Package, ShoppingCart } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../store/uiStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { isSidebarOpen } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Comprobar al cargar
    checkIfMobile();
    
    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const mobileMenuItems = [
    { 
      icon: Home, 
      label: 'Inicio', 
      path: '/dashboard',
    },
    { 
      icon: Package, 
      label: 'Servicios', 
      path: '/dashboard/services',
    },
    { 
      icon: Calendar, 
      label: 'Historial', 
      path: '/dashboard/appointment-history',
    },
    { 
      icon: ShoppingCart, 
      label: 'Tienda', 
      path: '/dashboard/products',
    },
    { 
      icon: Calendar, 
      label: 'Citas', 
      path: '/dashboard/my-appointments',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      {/* Contenido principal */}
      <div
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0' : (isSidebarOpen ? '16rem' : '5rem'),
          paddingBottom: isMobile ? '64px' : '0', // Espacio para el menú móvil
          marginTop: '0', // El padding top lo maneja cada componente
        }}
      >
        <main className="w-full">
          {children}
        </main>
      </div>
      
      {/* Menú móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around">
          {mobileMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                location.pathname === item.path
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              <item.icon className={`h-6 w-6 ${
                location.pathname === item.path
                  ? 'text-amber-600'
                  : 'text-gray-600'
              }`} />
              <span className="text-xs mt-1">{item.label}</span>
              {location.pathname === item.path && (
                <span className="absolute top-0 h-1 w-10 bg-amber-600 rounded-b-full"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;