import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // Estado para manejar errores
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar el error antes de hacer la solicitud

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      // Manejar errores específicos
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message); // Mostrar el mensaje de error del backend
      } else {
        setError('Error al iniciar sesión. Por favor, intenta nuevamente.'); // Mensaje genérico
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">¡Bienvenido!</h2>
        <p className="text-gray-600 mt-2">Ingresa tus credenciales para acceder</p>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              required
            />
            <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              required
            />
            <FaLock className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;