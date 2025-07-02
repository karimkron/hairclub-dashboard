import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordForm = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();

  // Recuperar el email del localStorage cuando el componente se monta
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem('resetEmail');
      if (storedEmail) {
        setEmail(JSON.parse(storedEmail));
      } else {
        setError('No se encontró el email para el restablecimiento de contraseña. Por favor, solicita un nuevo código.');
      }
    } catch (err) {
      console.error('Error al recuperar el email:', err);
      setError('Error al recuperar la información del restablecimiento de contraseña.');
    }
  }, []);

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return false;
    }
    
    if (!/\d/.test(newPassword)) {
      setError('La contraseña debe contener al menos un número');
      return false;
    }
    
    if (!/[.,!@#$%^&*]/.test(newPassword)) {
      setError('La contraseña debe contener al menos un carácter especial (.,!@#$%^&*)');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(code, newPassword);
      // Redirigir al login tras resetear la contraseña
      navigate('/login', { 
        state: { 
          message: 'Contraseña restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.'
        } 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña. Inténtelo nuevamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Restablecer Contraseña</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {email && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          Restableciendo contraseña para: {email}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Código de verificación</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          required
          disabled={isLoading}
          placeholder="Ingrese el código recibido por email"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Nueva Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            required
            disabled={isLoading}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          <p>La contraseña debe tener al menos:</p>
          <ul className="list-disc pl-5">
            <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>6 caracteres</li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>Una letra mayúscula</li>
            <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>Un número</li>
            <li className={/[.,!@#$%^&*]/.test(newPassword) ? 'text-green-600' : ''}>Un carácter especial</li>
          </ul>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Confirmar Contraseña</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            required
            disabled={isLoading}
          />
          <button 
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      <button
        type="submit"
        className={`w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Procesando...' : 'Restablecer Contraseña'}
      </button>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-amber-600 hover:text-amber-700 text-sm"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;