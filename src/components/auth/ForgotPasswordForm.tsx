import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    try {
      // Guardar el email en localStorage para usarlo posteriormente en el reseteo
      localStorage.setItem('resetEmail', JSON.stringify(email));
      
      await forgotPassword(email);
      setSuccess(true);
      
      // Mostrar mensaje de éxito brevemente antes de redireccionar
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el código de recuperación. Inténtelo nuevamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Recuperar Contraseña</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
          Se ha enviado un código de recuperación a tu correo electrónico. 
          Serás redirigido a la página de restablecimiento de contraseña.
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          required
          disabled={isLoading || success}
        />
      </div>
      <button
        type="submit"
        className={`w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        disabled={isLoading || success}
      >
        {isLoading ? 'Enviando...' : 'Enviar Código'}
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

export default ForgotPasswordForm;