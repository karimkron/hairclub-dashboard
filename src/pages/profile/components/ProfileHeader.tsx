// src/pages/profile/components/ProfileHeader.tsx
import React from 'react';
import { Camera, User } from 'lucide-react';
import { useUserStore } from '../../../store/user.store';

interface ProfileHeaderProps {
  onEditPersonalInfo: () => void;
  onEditPassword: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  onEditPersonalInfo, 
  onEditPassword 
}) => {
  const { profile, loading } = useUserStore();

  if (loading) {
    return (
      <div className="bg-white border rounded-lg shadow-sm w-full overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="mt-4 w-32 sm:w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="mt-2 w-24 sm:w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="mt-6 w-full flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="h-10 w-full sm:w-auto sm:min-w-[160px] bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-full sm:w-auto sm:min-w-[160px] bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm w-full overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative">
          {profile?.name ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {/* Si hay una imagen de perfil la mostraríamos aquí */}
              <div className="w-full h-full flex items-center justify-center bg-amber-600 text-white text-3xl sm:text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            </div>
          )}
          <button 
            className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-amber-600 rounded-full text-white hover:bg-amber-700"
            title="Cambiar foto de perfil"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="mt-4 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile?.name || 'Usuario'}</h1>
          <p className="text-sm sm:text-base text-gray-500 break-all">{profile?.email || 'correo@ejemplo.com'}</p>
          
          {profile?.role && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                {profile.role === 'user' ? 'Cliente' : 
                 profile.role === 'admin' ? 'Administrador' :
                 profile.role === 'superadmin' ? 'Super Administrador' : 
                 profile.role}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 w-full flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onEditPersonalInfo}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Información Personal
          </button>
          <button
            onClick={onEditPassword}
            className="w-full sm:w-auto px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;