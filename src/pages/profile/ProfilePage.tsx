// src/pages/profile/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Award, BadgeCheck, Calendar, Clock, LogOut } from 'lucide-react';
import ProfileHeader from './components/ProfileHeader';
import { useUserStore } from '../../store/user.store';
import { useAuthStore } from '../../store/auth.store';
import PersonalInfoModal from '../../components/modals/PersonalInfoModal';
import PasswordModal from '../../components/modals/PasswordModal';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const { profile, loading, error, fetchProfile } = useUserStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Cargar los datos del perfil cuando se monte el componente
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pt-14">
      {/* Cabecera del perfil */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader 
          onEditPersonalInfo={() => setShowPersonalInfoModal(true)}
          onEditPassword={() => setShowPasswordModal(true)}
        />
      </div>

      {/* Stats and Additional Info */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded mb-1"></div>
                  <div className="h-7 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente desde</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntos</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {profile?.points || 0}
                    </p>
                  </div>
                </div>
              </div> */}
              
              {/* <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nivel</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {profile?.rank ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) : 'Bronce'}
                    </p>
                  </div>
                </div>
              </div> */}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {profile?.isVerified ? 'Verificado' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* User Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-full max-w-md animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-full max-w-md animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-medium w-24">Teléfono:</span> 
                  <span>{profile?.phone || 'No disponible'}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-24">Miembro:</span> 
                  <span>{profile?.role === 'user' ? 'Cliente' : 
                         profile?.role === 'admin' ? 'Administrador' : 
                         profile?.role === 'superadmin' ? 'Super Administrador' : 
                         profile?.role || 'No disponible'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Botón de Cerrar Sesión */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PersonalInfoModal 
        isOpen={showPersonalInfoModal} 
        onClose={() => setShowPersonalInfoModal(false)} 
      />
      
      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ProfilePage;